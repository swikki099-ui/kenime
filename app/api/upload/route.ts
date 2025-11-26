import { NextResponse } from 'next/server';
import { writeFile, mkdir, rm, rename } from 'fs/promises';
import { join, dirname } from 'path';
import AdmZip from 'adm-zip';
import { requireAuth, createServiceClient } from '@/lib/auth/session';
import { validateZipStructure, validateFileContent, sanitizeZipPath } from '@/lib/utils/file-validator';
import { checkRateLimit } from '@/lib/utils/rate-limiter';

function generateId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(36))
    .join('')
    .substring(0, 10);
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    
    const rateLimit = await checkRateLimit(user.id, 'upload', user.daily_deploy_limit);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Daily upload limit reached. Please try again tomorrow.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const siteName = formData.get('siteName') as string;
    const isPreview = formData.get('isPreview') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.zip')) {
      return NextResponse.json(
        { error: 'Only ZIP files are allowed' },
        { status: 400 }
      );
    }

    const maxSizeMB = user.max_upload_size_mb || 100;
    if (file.size > maxSizeMB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File size exceeds ${maxSizeMB}MB limit` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();

    const files = zipEntries
      .filter((entry) => !entry.isDirectory)
      .map((entry) => ({
        name: entry.entryName,
        size: entry.header.size,
        content: entry.getData(),
      }));

    const validation = validateZipStructure(files);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid ZIP structure', details: validation.errors },
        { status: 400 }
      );
    }

    const MAX_EXTRACTED_SIZE_CHECK = 500 * 1024 * 1024;
    if (validation.totalSize > MAX_EXTRACTED_SIZE_CHECK) {
      return NextResponse.json(
        { error: `Total extracted size (${Math.round(validation.totalSize / 1024 / 1024)}MB) exceeds maximum limit of ${MAX_EXTRACTED_SIZE_CHECK / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    for (const file of files) {
      const contentValidation = validateFileContent(
        file.name,
        file.content.toString('utf-8')
      );
      if (!contentValidation.valid) {
        return NextResponse.json(
          { error: contentValidation.reason },
          { status: 400 }
        );
      }
    }

    const supabase = createServiceClient();
    const previewId = isPreview ? generateId() : null;
    const stagingId = generateId();
    const stagingPath = join(process.cwd(), 'public', '.staging', stagingId);
    const targetPath = isPreview
      ? join(process.cwd(), 'public', 'preview', previewId)
      : join(process.cwd(), 'public', 'sites', user.username);

    const MAX_EXTRACTED_SIZE = 500 * 1024 * 1024;
    let totalExtractedSize = 0;

    try {
      await mkdir(stagingPath, { recursive: true });

      for (const entry of zipEntries) {
        if (entry.isDirectory) continue;

        if (entry.header.made !== undefined && (entry.header.attr & 0x20000000) !== 0) {
          throw new Error('Symlinks are not allowed in ZIP files');
        }

        const sanitizedPath = sanitizeZipPath(entry.entryName, stagingPath);
        if (!sanitizedPath) {
          throw new Error(`Invalid or dangerous file path: ${entry.entryName}`);
        }

        const entryData = entry.getData();
        totalExtractedSize += entryData.length;

        if (totalExtractedSize > MAX_EXTRACTED_SIZE) {
          throw new Error(`Extracted size exceeds maximum limit of ${MAX_EXTRACTED_SIZE / 1024 / 1024}MB. Possible decompression bomb detected.`);
        }

        const filePath = join(stagingPath, sanitizedPath);
        const fileDir = join(filePath, '..');
        await mkdir(fileDir, { recursive: true });
        await writeFile(filePath, entryData);
      }

      if (isPreview) {
        await mkdir(join(process.cwd(), 'public', 'preview'), { recursive: true });
        await rename(stagingPath, targetPath);
      } else {
        await mkdir(join(process.cwd(), 'public', 'sites'), { recursive: true });
        
        const backupPath = join(process.cwd(), 'public', 'sites', `${user.username}.backup.${Date.now()}`);
        let backupCreated = false;

        try {
          await rename(targetPath, backupPath);
          backupCreated = true;
        } catch (err: any) {
          if (err.code !== 'ENOENT') {
            throw err;
          }
        }

        try {
          await rename(stagingPath, targetPath);
        } catch (renameErr) {
          if (backupCreated) {
            try {
              await rename(backupPath, targetPath);
            } catch (rollbackErr) {
              console.error('CRITICAL: Failed to rollback deployment after rename failure:', rollbackErr);
            }
          }
          throw renameErr;
        }

        if (backupCreated) {
          await rm(backupPath, { recursive: true, force: true }).catch(() => {});
        }
      }
    } catch (error: any) {
      await rm(stagingPath, { recursive: true, force: true }).catch(() => {});
      return NextResponse.json(
        { error: error.message || 'Upload failed' },
        { status: 400 }
      );
    }

    let siteId = null;
    if (!isPreview) {
      const { data: existingSite } = await supabase
        .from('sites')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', siteName || 'default')
        .single();

      if (existingSite) {
        siteId = existingSite.id;
        await supabase
          .from('sites')
          .update({
            storage_bytes: validation.totalSize,
            last_deployed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', siteId);
      } else {
        const { data: newSite } = await supabase
          .from('sites')
          .insert({
            user_id: user.id,
            name: siteName || 'default',
            storage_bytes: validation.totalSize,
            is_published: false,
            last_deployed_at: new Date().toISOString(),
          })
          .select()
          .single();

        siteId = newSite?.id;
      }
    }

    const { data: deployment } = await supabase
      .from('deployments')
      .insert({
        site_id: siteId,
        user_id: user.id,
        status: 'success',
        file_count: validation.fileCount,
        size_bytes: validation.totalSize,
        is_preview: isPreview,
        preview_id: previewId,
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      deployment: {
        id: deployment?.id,
        previewId: previewId,
        previewUrl: isPreview ? `/preview/${previewId}` : `/${user.username}`,
        fileCount: validation.fileCount,
        totalSize: validation.totalSize,
        warnings: validation.warnings,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    );
  }
}

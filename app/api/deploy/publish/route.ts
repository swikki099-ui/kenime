import { NextResponse } from 'next/server';
import { rename, rm, mkdir, cp } from 'fs/promises';
import { join } from 'path';
import { requireAuth, createServiceClient } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { previewId, siteId } = await request.json();

    if (!previewId || !siteId) {
      return NextResponse.json(
        { error: 'Preview ID and Site ID are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: site } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single();

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found or access denied' },
        { status: 404 }
      );
    }

    const previewPath = join(process.cwd(), 'public', 'preview', previewId);
    const sitePath = join(process.cwd(), 'public', 'sites', user.username);
    const backupPath = join(process.cwd(), 'public', 'sites', `${user.username}.backup.${Date.now()}`);
    const tempPath = join(process.cwd(), 'public', 'sites', `${user.username}.tmp.${Date.now()}`);

    await mkdir(join(process.cwd(), 'public', 'sites'), { recursive: true });

    try {
      await cp(previewPath, tempPath, { recursive: true });

      try {
        await rename(sitePath, backupPath);
      } catch (err: any) {
        if (err.code !== 'ENOENT') {
          await rm(tempPath, { recursive: true, force: true });
          throw err;
        }
      }

      await rename(tempPath, sitePath);

      await rm(previewPath, { recursive: true, force: true });
      await rm(backupPath, { recursive: true, force: true });
    } catch (error) {
      await rm(tempPath, { recursive: true, force: true });
      if (backupPath) {
        try {
          await rename(backupPath, sitePath);
        } catch (rollbackErr) {
          console.error('Failed to rollback deployment:', rollbackErr);
        }
      }
      throw error;
    }

    await supabase
      .from('sites')
      .update({
        is_published: true,
        last_deployed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', siteId);

    return NextResponse.json({
      success: true,
      liveUrl: `/${user.username}`,
    });
  } catch (error: any) {
    console.error('Publish error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Publish failed', details: error.message },
      { status: 500 }
    );
  }
}

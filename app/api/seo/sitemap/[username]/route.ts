import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import * as cheerio from 'cheerio';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const sitePath = join(process.cwd(), 'public', 'sites', username);

    const files = await getAllHtmlFiles(sitePath);
    const baseUrl = `https://kenime.cc/${username}`;

    const urlEntries = await Promise.all(
      files.map(async (file) => {
        const relativePath = file.replace(sitePath, '').replace(/\\/g, '/');
        const url = `${baseUrl}${relativePath}`;
        
        return `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      })
    );

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate sitemap' },
      { status: 500 }
    );
  }
}

async function getAllHtmlFiles(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          return getAllHtmlFiles(fullPath);
        } else if (entry.name.endsWith('.html')) {
          return [fullPath];
        }
        return [];
      })
    );
    return files.flat();
  } catch (error) {
    return [];
  }
}

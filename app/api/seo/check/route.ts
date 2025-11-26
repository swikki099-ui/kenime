import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import * as cheerio from 'cheerio';
import { requireAuth } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { username } = await request.json();

    if (username !== user.username) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const sitePath = join(process.cwd(), 'public', 'sites', username);
    const indexPath = join(sitePath, 'index.html');

    const issues: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    try {
      const html = await readFile(indexPath, 'utf-8');
      const $ = cheerio.load(html);

      if (!$('title').length) {
        issues.push('Missing <title> tag');
      } else if ($('title').text().length < 10) {
        warnings.push('Title tag is too short (should be 10-60 characters)');
      } else if ($('title').text().length > 60) {
        warnings.push('Title tag is too long (should be 10-60 characters)');
      }

      if (!$('meta[name="description"]').length) {
        issues.push('Missing meta description');
      } else {
        const desc = $('meta[name="description"]').attr('content') || '';
        if (desc.length < 50) {
          warnings.push('Meta description is too short (should be 50-160 characters)');
        } else if (desc.length > 160) {
          warnings.push('Meta description is too long (should be 50-160 characters)');
        }
      }

      if (!$('link[rel="icon"]').length && !$('link[rel="shortcut icon"]').length) {
        suggestions.push('Add a favicon for better branding');
      }

      const h1Count = $('h1').length;
      if (h1Count === 0) {
        warnings.push('No H1 heading found');
      } else if (h1Count > 1) {
        warnings.push('Multiple H1 headings found (should have only one)');
      }

      const imgWithoutAlt = $('img:not([alt])');
      if (imgWithoutAlt.length > 0) {
        warnings.push(`${imgWithoutAlt.length} images missing alt attributes`);
      }

      const brokenLinks: string[] = [];
      $('a[href]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href && href.startsWith('#') && !$(href).length) {
          brokenLinks.push(href);
        }
      });

      if (brokenLinks.length > 0) {
        warnings.push(`${brokenLinks.length} potentially broken internal links`);
      }

      if (!$('meta[name="viewport"]').length) {
        suggestions.push('Add viewport meta tag for mobile responsiveness');
      }

      const ogTitle = $('meta[property="og:title"]');
      const ogDescription = $('meta[property="og:description"]');
      const ogImage = $('meta[property="og:image"]');

      if (!ogTitle.length || !ogDescription.length || !ogImage.length) {
        suggestions.push('Add Open Graph meta tags for better social sharing');
      }

      return NextResponse.json({
        success: true,
        seo: {
          score: calculateScore(issues, warnings, suggestions),
          issues,
          warnings,
          suggestions,
          title: $('title').text() || '',
          description: $('meta[name="description"]').attr('content') || '',
          hasH1: h1Count > 0,
          hasViewport: $('meta[name="viewport"]').length > 0,
          hasFavicon: $('link[rel="icon"]').length > 0,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'index.html not found or invalid' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('SEO check error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'SEO check failed' },
      { status: 500 }
    );
  }
}

function calculateScore(
  issues: string[],
  warnings: string[],
  suggestions: string[]
): number {
  let score = 100;
  score -= issues.length * 20;
  score -= warnings.length * 10;
  score -= suggestions.length * 5;
  return Math.max(0, score);
}

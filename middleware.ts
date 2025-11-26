import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/preview') ||
    pathname.startsWith('/sites') ||
    pathname === '/' ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg')
  ) {
    return NextResponse.next();
  }

  const pathParts = pathname.split('/').filter(Boolean);
  
  if (pathParts.length >= 1) {
    const username = pathParts[0];
    const filePath = pathParts.slice(1).join('/') || 'index.html';

    const url = request.nextUrl.clone();
    url.pathname = `/sites/${username}/${filePath}`;

    const response = NextResponse.rewrite(url);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value;
  const userRole = request.cookies.get('session_user_role')?.value;
  const { pathname } = request.nextUrl;
  const lowerPath = pathname.toLowerCase();

  // 1. Proteksi Halaman Admin & Direct URL /admin
  if (pathname.startsWith('/dashboard-admin') || lowerPath === '/admin' || lowerPath.startsWith('/admin/')) {
    if (!userId || userRole !== 'Admin') {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
    // Jika admin mengakses /admin secara langsung, arahkan ke dashboard-admin
    if (lowerPath === '/admin') {
      return NextResponse.redirect(new URL('/dashboard-admin', request.url));
    }
  }

  // 2. Proteksi Halaman Pelanggan & Direct URL /pelanggan
  if (
    (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard-admin')) ||
    lowerPath === '/pelanggan' ||
    lowerPath.startsWith('/pelanggan/')
  ) {
    if (!userId || userRole !== 'Pelanggan') {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
    // Jika pelanggan mengakses /pelanggan secara langsung, arahkan ke dashboard
    if (lowerPath === '/pelanggan') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/dashboard-admin/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/admin/:path*',
    '/pelanggan/:path*',
    '/admin',
    '/pelanggan',
    '/Admin',
    '/Pelanggan',
    '/Admin/:path*',
    '/Pelanggan/:path*',
  ],
};


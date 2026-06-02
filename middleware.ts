import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('session_user_id')?.value;
  const userRole = request.cookies.get('session_user_role')?.value;
  const { pathname } = request.nextUrl;

  // 1. Proteksi Halaman Admin
  if (pathname.startsWith('/dashboard-admin')) {
    if (!userId) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== 'Admin') {
      // Jika login tapi bukan Admin, arahkan ke dasbor pelanggan
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 2. Proteksi Halaman Pelanggan (User)
  if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard-admin')) {
    if (!userId) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole === 'Admin') {
      // Jika Admin mencoba masuk ke dasbor pelanggan, arahkan ke dasbor admin
      return NextResponse.redirect(new URL('/dashboard-admin', request.url));
    }
  }

  // 3. Proteksi Halaman Auth (jika sudah login tidak boleh kembali ke login/register/forgot-password)
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';
  if (isAuthPage && userId) {
    if (userRole === 'Admin') {
      return NextResponse.redirect(new URL('/dashboard-admin', request.url));
    } else {
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
  ],
};

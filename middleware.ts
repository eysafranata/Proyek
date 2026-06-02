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

  // 3. Proteksi Halaman Auth dinonaktifkan agar form login selalu muncul saat tombol Masuk diklik
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

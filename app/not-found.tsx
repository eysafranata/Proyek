'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Poppins } from 'next/font/google';
import { ShieldExclamationIcon, HomeIcon } from '@heroicons/react/24/outline';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export default function NotFound() {
  return (
    <div className={`min-h-screen bg-[#f4fcf7] flex flex-col justify-between ${poppins.className} text-gray-800`}>
      {/* Navbar Minimalist */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 shadow-sm w-full">
        <div className="flex items-center gap-2">
          <Image 
            src="/logo1.jpeg" 
            alt="Logo KirimAja" 
            width={40} 
            height={40} 
            className="object-contain rounded" 
          />
          <div>
            <h1 className="text-xl font-bold text-[#0c5132] leading-tight">KirimAja</h1>
            <p className="text-xs text-gray-500 font-medium">Pengiriman Terpercaya</p>
          </div>
        </div>
      </nav>

      {/* Main 404 Graphic & Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg bg-white rounded-[40px] p-8 md:p-12 shadow-xl border border-emerald-100/50 text-center relative overflow-hidden">
          {/* Subtle design accents */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#e6fce5] rounded-full blur-2xl opacity-70"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-50 rounded-full blur-2xl opacity-70"></div>

          {/* Icon */}
          <div className="mx-auto w-24 h-24 bg-[#e6fce5] text-[#24a173] rounded-full flex items-center justify-center mb-8 border border-emerald-100 shadow-sm animate-pulse">
            <ShieldExclamationIcon className="w-12 h-12" strokeWidth={1.5} />
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-black text-[#0c5132] mb-3 tracking-tight">404</h2>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Halaman Tidak Ditemukan</h3>

          {/* Description */}
          <p className="text-gray-500 font-medium text-sm md:text-base mb-8 leading-relaxed">
            Halaman yang Anda tuju tidak tersedia, telah dipindahkan, atau Anda tidak memiliki hak akses untuk membukanya.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-[#24a173] text-white px-6 py-3.5 rounded-2xl font-bold text-sm md:text-base hover:bg-[#1b8555] transition-all shadow-md active:scale-95 hover:shadow-lg"
            >
              <HomeIcon className="w-5 h-5" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center border-t border-gray-100 bg-white text-xs text-gray-400">
        <p>© 2026 KirimAja Logistics. All rights reserved.</p>
      </footer>
    </div>
  );
}

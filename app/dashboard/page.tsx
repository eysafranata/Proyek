'use client';

import { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import {
  Bars3Icon,
  CubeIcon,
  ArrowTrendingUpIcon,
  StarIcon,
  MagnifyingGlassIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Sidebar from '@/components/Sidebar';
import { getCurrentUser } from '@/app/lib/actions';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('...');

  useEffect(() => {
    async function loadUser() {
      const data = await getCurrentUser();
      if (data) {
        setUserName(data.name);
      }
    }
    loadUser();
  }, []);

  return (
    <div className={`min-h-screen bg-[#f4fcf7] pb-10 ${poppins.className}`}>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Top Navbar */}
      <nav className="bg-white flex items-center px-6 md:px-10 py-5 sticky top-0 z-50 shadow-sm border-b border-gray-100 w-full">
        <button onClick={() => setIsSidebarOpen(true)} className="mr-4 hover:bg-gray-100 p-2 rounded-lg transition-colors">
          <Bars3Icon className="w-6 h-6 text-gray-800" />
        </button>
        <div className="flex items-center gap-3">
          <Image src="/logo1.jpeg" alt="Logo KirimAja" width={36} height={36} className="object-contain rounded" />
          <span className="text-2xl md:text-3xl font-extrabold text-[#0c5132] tracking-tight">KirimAja</span>
        </div>
      </nav>

      {/* Main Content fully responsive and full-width */}
      <div className="w-full">

        {/* Full Width Hero Section */}
        <div className="relative w-full">
          {/* Green Background stretching full width */}
          <div className="bg-[#24a173] pt-10 md:pt-16 pb-24 md:pb-36 px-6 md:px-12 xl:px-24 relative overflow-hidden w-full">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

            <div className="relative z-10 w-full max-w-screen-2xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 md:mb-3">Halo, {userName}! 👋</h1>
              <p className="text-emerald-50 text-[15px] md:text-lg mb-1.5 md:mb-2 font-medium">Selamat datang di KirimAja</p>
              <p className="text-emerald-100/90 text-[13px] md:text-base">Solusi pengiriman UMKM yang ramah dan terpercaya</p>
            </div>
          </div>

          {/* Stats Cards (Overlapping) */}
          <div className="absolute -bottom-12 md:-bottom-16 left-0 right-0 px-6 md:px-12 xl:px-24">
            <div className="w-full max-w-screen-2xl mx-auto flex justify-between gap-4 md:gap-8">
              {/* Card 1 */}
              <div className="bg-white flex-1 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 py-5 md:py-8 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                <CubeIcon className="w-6 h-6 md:w-9 md:h-9 text-[#24a173] mb-2 md:mb-3" />
                <div className="text-2xl md:text-4xl font-bold text-[#0c5132] leading-none mb-1 md:mb-2">3</div>
                <div className="text-[11px] md:text-sm font-semibold text-gray-500">Total Paket</div>
              </div>
              {/* Card 2 */}
              <div className="bg-white flex-1 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 py-5 md:py-8 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                <ArrowTrendingUpIcon className="w-6 h-6 md:w-9 md:h-9 text-[#24a173] mb-2 md:mb-3" />
                <div className="text-2xl md:text-4xl font-bold text-[#0c5132] leading-none mb-1 md:mb-2">2</div>
                <div className="text-[11px] md:text-sm font-semibold text-gray-500">Aktif</div>
              </div>
              {/* Card 3 */}
              <div className="bg-white flex-1 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 py-5 md:py-8 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                <StarIcon className="w-6 h-6 md:w-9 md:h-9 text-[#24a173] mb-2 md:mb-3" />
                <div className="text-2xl md:text-4xl font-bold text-[#0c5132] leading-none mb-1 md:mb-2">1</div>
                <div className="text-[11px] md:text-sm font-semibold text-gray-500">Selesai</div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacing for overlapping cards */}
        <div className="h-20 md:h-28"></div>

        <div className="w-full max-w-screen-2xl mx-auto px-6 md:px-12 xl:px-24">

          {/* Menu Cepat */}
          <div className="mb-10 md:mb-14">
            <h2 className="text-[#0c5132] font-bold text-[16px] md:text-xl mb-4 md:mb-6">Menu Cepat</h2>
            <div className="flex gap-4 md:gap-8">
              <Link href="/lacak-paket" className="bg-white border border-gray-200 rounded-3xl p-5 md:p-10 flex-1 flex flex-col items-center justify-center shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <div className="bg-[#e6f7ec] w-14 h-14 md:w-20 md:h-20 rounded-[20px] flex items-center justify-center mb-4">
                  <MagnifyingGlassIcon className="w-6 h-6 md:w-9 md:h-9 text-[#24a173]" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-gray-800 text-[14px] md:text-lg mb-1 md:mb-2">Lacak Paket</h3>
                <p className="text-[11px] md:text-sm text-gray-400">Cek status pengiriman</p>
              </Link>

              <Link href="#" className="bg-white border border-gray-200 rounded-3xl p-5 md:p-10 flex-1 flex flex-col items-center justify-center shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <div className="bg-[#e6f7ec] w-14 h-14 md:w-20 md:h-20 rounded-[20px] flex items-center justify-center mb-4">
                  <ClockIcon className="w-6 h-6 md:w-9 md:h-9 text-[#24a173]" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-gray-800 text-[14px] md:text-lg mb-1 md:mb-2">Riwayat</h3>
                <p className="text-[11px] md:text-sm text-gray-400">Lihat semua paket</p>
              </Link>
            </div>
          </div>

          {/* Paket Aktif */}
          <div className="mb-10 md:mb-14">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-[#0c5132] font-bold text-[16px] md:text-xl">Paket Aktif</h2>
              <Link href="#" className="text-[#24a173] text-[12px] md:text-base font-bold hover:underline">Lihat Semua</Link>
            </div>

            <div className="flex flex-col gap-4 md:gap-6">
              {/* Item 1 */}
              <div className="bg-white border border-gray-200 rounded-[24px] md:rounded-[32px] p-5 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between transition-shadow hover:shadow-md">
                <div>
                  <div className="flex justify-between md:justify-start items-center mb-2 md:mb-3 gap-4">
                    <span className="font-bold text-gray-800 text-[14px] md:text-lg">CKL2026040001</span>
                    <span className="md:hidden bg-[#e6f7ec] text-[#24a173] text-[11px] font-bold px-3 py-1.5 rounded-full">Dalam Perjalanan</span>
                  </div>
                  <p className="text-gray-500 text-[12px] md:text-base mb-4 md:mb-5 font-medium">Jakarta Pusat → Bandung</p>
                  <div className="flex items-center gap-2 text-[12px] md:text-sm text-gray-400 font-medium">
                    <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop" alt="Foto Kurir" className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover border border-gray-200" />
                    <span className="text-[#24a173]">Kurir:</span> Ahmad Kurniawan
                  </div>
                </div>
                <div className="hidden md:block">
                  <span className="bg-[#e6f7ec] text-[#24a173] text-base md:text-lg font-bold px-6 py-3 rounded-full">Dalam Perjalanan</span>
                </div>
              </div>

              {/* Item 2 */}
              <div className="bg-white border border-gray-200 rounded-[24px] md:rounded-[32px] p-5 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between transition-shadow hover:shadow-md">
                <div>
                  <div className="flex justify-between md:justify-start items-center mb-2 md:mb-3 gap-4">
                    <span className="font-bold text-gray-800 text-[14px] md:text-lg">CKL2026040003</span>
                    <span className="md:hidden bg-[#e6f7ec] text-[#24a173] text-[11px] font-bold px-3 py-1.5 rounded-full">Dalam Pengiriman</span>
                  </div>
                  <p className="text-gray-500 text-[12px] md:text-base mb-4 md:mb-5 font-medium">Yogyakarta → Semarang</p>
                  <div className="flex items-center gap-2 text-[12px] md:text-sm text-gray-400 font-medium">
                    <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop" alt="Foto Kurir" className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover border border-gray-200" />
                    <span className="text-[#24a173]">Kurir:</span> Ahmad Kurniawan
                  </div>
                </div>
                <div className="hidden md:block">
                  <span className="bg-[#e6f7ec] text-[#24a173] text-base md:text-lg font-bold px-6 py-3 rounded-full">Dalam Pengiriman</span>
                </div>
              </div>
            </div>
          </div>

          {/* Promo Banner */}
          <div className="pb-12">
            <div className="bg-[#56d9a1] rounded-[24px] md:rounded-[40px] p-5 md:p-10 flex items-center gap-5 md:gap-8 relative overflow-hidden shadow-sm">
              <div className="w-[60px] h-[60px] md:w-[90px] md:h-[90px] bg-[#221f1e] rounded-[16px] md:rounded-[24px] flex-shrink-0 flex items-center justify-center shadow-inner relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=200&h=200&fit=crop" alt="Ilustrasi Paket" className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100" />
              </div>
              <div className="relative z-10 flex-1">
                <h3 className="font-bold text-white text-[16px] md:text-[24px] mb-1 md:mb-2">Kirim Paket Mudah!</h3>
                <p className="text-emerald-50 text-[12px] md:text-[16px] font-medium leading-snug">Dapatkan harga terbaik untuk pengiriman UMKM Anda</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

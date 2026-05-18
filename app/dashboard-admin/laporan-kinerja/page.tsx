'use client';

import { useState } from 'react';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import {
  Bars3Icon,
  CubeIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { ChartBarIcon as ChartBarSolidIcon } from '@heroicons/react/24/solid';
import AdminSidebar from '@/app/ui/dashboard/admin-sidebar';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export default function LaporanKinerja() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className={`min-h-screen bg-[#f4fcf7] pb-10 ${poppins.className}`}>
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {/* Top Navbar */}
      <nav className="flex items-center px-6 md:px-10 py-4 w-full bg-[#f4fcf7] sticky top-0 z-50">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="mr-5 text-[#24a173] hover:bg-[#e6fce5] p-2 rounded-lg transition-colors"
        >
          <Bars3Icon className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-[#e6fce5] p-2.5 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-center">
            <CubeIcon className="w-6 h-6 text-[#1b8555] stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-extrabold text-[#0c5132] tracking-tight block leading-none mb-0.5 shadow-sm">KirimAja</span>
            <span className="text-[11px] md:text-xs text-[#24a173] font-bold uppercase tracking-wider block">Admin</span>
          </div>
        </div>
      </nav>

      <div className="px-6 md:px-10 max-w-screen-xl mx-auto flex flex-col gap-6">

        {/* Header Section */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <Link href="/dashboard-admin" className="p-2 hover:bg-[#e6fce5] rounded-full transition-colors text-[#24a173]">
              <ArrowLeftIcon className="w-5 h-5" strokeWidth={2.5} />
            </Link>
            <div>
              <h1 className="text-lg md:text-xl font-extrabold text-[#0c5132] flex items-center gap-2">
                Laporan Kinerja 📊
              </h1>
              <p className="text-xs text-gray-500 font-medium">Analisa performa layanan KirimAja</p>
            </div>
          </div>
          <button className="bg-[#24a173] hover:bg-[#1b8555] text-white text-[10px] md:text-xs font-semibold py-2 px-3 rounded-full flex items-center gap-1.5 shadow-sm transition-colors">
            <ArrowDownTrayIcon className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Unduh Laporan</span>
          </button>
        </div>

        {/* Ringkasan Pengiriman */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-[#24a173]">
            <DocumentTextIcon className="w-4 h-4" strokeWidth={2} />
            <h2 className="font-bold text-xs md:text-sm text-[#0c5132]">Ringkasan Pengiriman</h2>
          </div>
          <div className="flex flex-col gap-2">
            <div className="bg-[#dcfce7] rounded-xl p-3 flex justify-between items-center">
              <span className="text-xs font-semibold text-[#0c5132]">Total Paket</span>
              <span className="text-sm font-extrabold text-[#0c5132]">3</span>
            </div>
            <div className="bg-[#dcfce7] rounded-xl p-3 flex justify-between items-center">
              <span className="text-xs font-semibold text-[#0c5132]">Selesai</span>
              <span className="text-sm font-extrabold text-[#24a173]">1</span>
            </div>
            <div className="bg-[#dcfce7] rounded-xl p-3 flex justify-between items-center">
              <span className="text-xs font-semibold text-[#0c5132]">Dalam Proses</span>
              <span className="text-sm font-extrabold text-[#d97706]">1</span>
            </div>
          </div>
        </div>

        {/* Pendapatan Bulan Ini */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-[#24a173]">
            <ChartBarIcon className="w-4 h-4" strokeWidth={2} />
            <h2 className="font-bold text-xs md:text-sm text-[#0c5132]">Pendapatan Bulan Ini</h2>
          </div>
          <div className="bg-[#dcfce7] rounded-[20px] p-6 flex flex-col items-center justify-center">
            <p className="text-[10px] md:text-xs text-gray-500 font-medium mb-1">Total Estimasi Pendapatan</p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-[#0c5132] mb-2">Rp 108.000</h3>
            <span className="bg-[#bbf7d0] text-[#166534] text-[10px] font-bold px-3 py-1 rounded-full">
              +15.2% dari bulan lalu
            </span>
          </div>
        </div>

        {/* Tren Pendapatan Harian */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-[#24a173]">
            <ArrowTrendingUpIcon className="w-4 h-4" strokeWidth={2} />
            <h2 className="font-bold text-xs md:text-sm text-[#0c5132]">Tren Pendapatan Harian</h2>
          </div>
          {/* Mockup Line Chart */}
          <div className="relative w-full h-[160px] md:h-[200px] mt-2 mb-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 h-full flex flex-col justify-between text-[8px] md:text-[10px] text-gray-400 font-medium pb-6">
              <span>Rp 80k</span>
              <span>Rp 60k</span>
              <span>Rp 40k</span>
              <span>Rp 20k</span>
              <span>Rp 0k</span>
            </div>
            <div className="ml-10 h-[140px] md:h-[180px] border-l border-b border-gray-200 relative">
              {/* Horizontal lines */}
              <div className="absolute w-full h-full flex flex-col justify-between">
                <div className="w-full border-t border-gray-100 border-dashed h-0"></div>
                <div className="w-full border-t border-gray-100 border-dashed h-0"></div>
                <div className="w-full border-t border-gray-100 border-dashed h-0"></div>
                <div className="w-full border-t border-gray-100 border-dashed h-0"></div>
                <div className="w-full h-0"></div>
              </div>

              {/* Line chart svg */}
              <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                <path d="M0,70 L100%,20" fill="none" stroke="#24a173" strokeWidth="2" />
                <circle cx="0" cy="70" r="3" fill="#24a173" />
                <circle cx="100%" cy="20" r="3" fill="#24a173" />
              </svg>

              {/* X-axis labels */}
              <div className="absolute -bottom-5 w-full flex justify-between text-[8px] md:text-[10px] text-gray-400 font-medium">
                <span className="-ml-2">3 Apr</span>
                <span className="-mr-2">5 Apr</span>
              </div>
            </div>
            {/* Legend */}
            <div className="flex justify-center items-center mt-6 gap-2 text-[8px] md:text-[10px] font-bold text-[#24a173]">
              <div className="w-3 border-t-2 border-[#24a173]"></div>
              <span>Pendapatan (Rp)</span>
            </div>
          </div>
        </div>

        {/* Volume Paket Harian */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-[#24a173]">
            <ChartBarSolidIcon className="w-4 h-4" />
            <h2 className="font-bold text-xs md:text-sm text-[#0c5132]">Volume Paket Harian</h2>
          </div>
          {/* Mockup Bar Chart */}
          <div className="relative w-full h-[160px] md:h-[200px] mt-2 mb-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 h-full flex flex-col justify-between text-[8px] md:text-[10px] text-gray-400 font-medium pb-6 w-4 text-right">
              <span>4</span>
              <span>3</span>
              <span>2</span>
              <span>1</span>
              <span>0</span>
            </div>
            <div className="ml-8 h-[140px] md:h-[180px] border-l border-b border-gray-200 relative flex justify-around items-end">
              {/* Horizontal lines */}
              <div className="absolute inset-0 w-full h-full flex flex-col justify-between -z-10 pointer-events-none">
                <div className="w-full border-t border-gray-100 border-dashed h-0"></div>
                <div className="w-full border-t border-gray-100 border-dashed h-0"></div>
                <div className="w-full border-t border-gray-100 border-dashed h-0"></div>
                <div className="w-full border-t border-gray-100 border-dashed h-0"></div>
                <div className="w-full h-0"></div>
              </div>

              {/* Bar 1 */}
              <div className="w-6 md:w-10 bg-[#24a173] rounded-t-sm h-[25%] relative group">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">1</div>
              </div>

              {/* Bar 2 */}
              <div className="w-6 md:w-10 bg-[#24a173] rounded-t-sm h-[50%] relative group">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">2</div>
              </div>

              {/* X-axis labels */}
              <div className="absolute -bottom-5 w-full flex justify-around text-[8px] md:text-[10px] text-gray-400 font-medium">
                <span>3 Apr</span>
                <span>5 Apr</span>
              </div>
            </div>
            {/* Legend */}
            <div className="flex justify-center items-center mt-6 gap-2 text-[8px] md:text-[10px] font-bold text-[#24a173]">
              <div className="w-2.5 h-2.5 bg-[#24a173] rounded-[1px]"></div>
              <span>Jumlah Paket</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

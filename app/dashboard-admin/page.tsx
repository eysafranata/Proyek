'use client';

import { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import {
  Bars3Icon,
  UsersIcon,
  CubeIcon,
  TruckIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { getUserStats } from '@/app/lib/actions';
import AdminSidebar from '@/app/ui/dashboard/admin-sidebar';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

function formatSysDate(d: Date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function buildSmoothPath(data: any[], width: number, height: number, maxVal: number) {
  if (data.length === 0) return '';
  const dx = width / Math.max(data.length - 1, 1);
  let d = `M0,${height - (data[0].value / maxVal) * height}`;
  for (let i = 1; i < data.length; i++) {
     const prevX = (i - 1) * dx;
     const prevY = height - (data[i - 1].value / maxVal) * height;
     const currX = i * dx;
     const currY = height - (data[i].value / maxVal) * height;
     const cx1 = prevX + dx * 0.5;
     const cy1 = prevY;
     const cx2 = prevX + dx * 0.5;
     const cy2 = currY;
     d += ` C${cx1},${cy1} ${cx2},${cy2} ${currX},${currY}`;
  }
  return d;
}

export default function DashboardAdmin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [totalCustomers, setTotalCustomers] = useState(3);
  const [chartData, setChartData] = useState([
    { time: new Date(2026, 3, 1), value: 12 },
    { time: new Date(2026, 3, 6), value: 9 },
    { time: new Date(2026, 3, 11), value: 6 },
    { time: new Date(2026, 3, 16), value: 3 },
    { time: new Date(2026, 3, 21), value: 0 },
    { time: new Date(2026, 3, 26), value: 5 },
  ]);

  useEffect(() => {
    // Initial fetch
    const fetchStats = async () => {
      const stats = await getUserStats();
      setTotalCustomers(stats.totalCustomers);
    };
    fetchStats();

    // Refresh setiap 2 menit nyata (120000 ms)
    const interval = setInterval(async () => {
      const stats = await getUserStats();
      setTotalCustomers(stats.totalCustomers);

      setChartData(prev => {
        const lastTime = prev[prev.length - 1].time;
        const nextTime = new Date(lastTime.getTime() + 8 * 60 * 60 * 1000); // Tambah 8 jam
        const nextValue = stats.totalCustomers + Math.floor(Math.random() * 3); // Sync slightly with total

        const newArray = [...prev, { time: nextTime, value: nextValue }];
        if (newArray.length > 6) {
          newArray.shift();
        }
        return newArray;
      });
    }, 120000); 
    
    return () => clearInterval(interval);
  }, []);

  const pathData = buildSmoothPath(chartData, 800, 180, 12);
  const fillData = `${pathData} L800,180 L0,180 Z`;
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

      {/* Main Content */}
      <div className="px-6 md:px-10 mt-6 md:mt-8 max-w-screen-xl mx-auto">
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0c5132] mb-1.5 flex items-center gap-2">Dashboard Admin <span className="text-2xl">👨‍💻</span></h1>
          <p className="text-gray-500 text-sm md:text-base font-medium">Kelola sistem KirimAja</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Card 1: Total Pengguna */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:border-blue-100">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-[#4182FF] text-white p-3 md:p-3.5 rounded-[14px] shadow-sm">
                <UsersIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
              </div>
              <span className="text-xs font-bold text-[#24a173] px-2 py-1 bg-[#e6fce5] rounded-full">+12%</span>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-400 font-semibold mb-1 tracking-wide">Total Pengguna</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-[#0c5132]">{totalCustomers}</h3>
            </div>
          </div>

          {/* Card 2: Total Pengiriman */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:border-green-100">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-[#24a173] text-white p-3 md:p-3.5 rounded-[14px] shadow-sm">
                <CubeIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
              </div>
              <span className="text-xs font-bold text-[#24a173] px-2 py-1 bg-[#e6fce5] rounded-full">+8%</span>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-400 font-semibold mb-1 tracking-wide">Total Pengiriman</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-[#0c5132]">3</h3>
            </div>
          </div>

          {/* Card 3: Dalam Pengiriman */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:border-orange-100">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-[#F8A000] text-white p-3 md:p-3.5 rounded-[14px] shadow-sm">
                <TruckIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
              </div>
              <span className="text-xs font-bold text-[#24a173] px-2 py-1 bg-[#e6fce5] rounded-full">5 paket</span>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-400 font-semibold mb-1 tracking-wide">Dalam Pengiriman</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-[#0c5132]">1</h3>
            </div>
          </div>

          {/* Card 4: Selesai Hari Ini */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:border-emerald-100">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-[#1b8555] text-white p-3 md:p-3.5 rounded-[14px] shadow-sm">
                <CheckCircleIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
              </div>
              <span className="text-xs font-bold text-[#24a173] px-2 py-1 bg-[#e6fce5] rounded-full">+20%</span>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-400 font-semibold mb-1 tracking-wide">Selesai Hari Ini</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-[#0c5132]">1</h3>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="flex flex-col gap-6 md:gap-8 mb-8">
          {/* Chart 1: Tren Pengiriman */}
          <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <CubeIcon className="w-5 h-5 md:w-6 md:h-6 text-[#24a173]" strokeWidth={2} />
                <h3 className="font-extrabold text-[#0c5132] text-sm md:text-lg">Tren Pengiriman (Bulan Ini)</h3>
              </div>
              <span className="bg-[#e6fce5] text-[#24a173] text-[10px] md:text-xs font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full flex items-center gap-2 shadow-sm border border-emerald-50">
                <span className="w-2 h-2 bg-[#24a173] rounded-full inline-block animate-pulse"></span>
                Live
              </span>
            </div>
            <div className="w-full h-[200px] md:h-[260px] relative">
              <svg viewBox="0 0 800 200" className="w-full h-full preserve-3d overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#24a173" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#24a173" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <line x1="0" y1="180" x2="800" y2="180" stroke="#f1f5f9" strokeWidth="1.5" />
                <line x1="0" y1="135" x2="800" y2="135" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="6 6" />
                <line x1="0" y1="90" x2="800" y2="90" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="6 6" />
                <line x1="0" y1="45" x2="800" y2="45" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="6 6" />
                <line x1="0" y1="0" x2="800" y2="0" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="6 6" />
                
                {/* Simulated Data Curve */}
                <path d="M0,110 C40,110 50,110 60,105 C70,100 80,120 90,140 C100,160 110,165 120,150 C130,135 140,90 150,60 C160,30 170,25 180,45 C190,65 200,80 210,80 C220,80 230,60 240,45 C250,30 260,35 270,55 C280,75 290,100 300,100 C310,100 320,60 330,35 C340,10 350,15 360,25 C370,35 380,80 390,120 C400,160 410,180 430,180 C450,180 800,180 800,180" 
                      fill="none" stroke="#24a173" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M0,110 C40,110 50,110 60,105 C70,100 80,120 90,140 C100,160 110,165 120,150 C130,135 140,90 150,60 C160,30 170,25 180,45 C190,65 200,80 210,80 C220,80 230,60 240,45 C250,30 260,35 270,55 C280,75 290,100 300,100 C310,100 320,60 330,35 C340,10 350,15 360,25 C370,35 380,80 390,120 C400,160 410,180 430,180 L430,180 L800,180 L800,180 L0,180 Z" 
                      fill="url(#colorGreen)" />
              </svg>
              {/* x-axis labels */}
              <div className="absolute bottom-0 left-0 w-full flex justify-between pt-2 px-1 text-[10px] md:text-xs text-gray-400 font-medium">
                <span>1 Apr</span><span>6 Apr</span><span>11 Apr</span><span>16 Apr</span><span>21 Apr</span><span>26 Apr</span>
              </div>
              <div className="absolute top-0 left-0 h-full flex flex-col justify-between pb-[18px] pr-2 text-[10px] md:text-xs text-gray-400 font-medium -translate-x-full pr-3">
                <span>40</span><span>30</span><span>20</span><span>10</span><span>0</span>
              </div>
            </div>
          </div>

          {/* Chart 2: Pendaftaran Pngguna */}
          <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <UsersIcon className="w-5 h-5 md:w-6 md:h-6 text-[#4182FF]" strokeWidth={2} />
                <h3 className="font-extrabold text-[#0c5132] text-sm md:text-lg">Pendaftaran Pengguna Baru</h3>
              </div>
              <span className="bg-[#eef4fc] text-[#4182FF] text-[10px] md:text-xs font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full flex items-center gap-2 shadow-sm border border-blue-50">
                <span className="w-2 h-2 bg-[#4182FF] rounded-full inline-block animate-pulse"></span>
                Live
              </span>
            </div>
            <div className="w-full h-[200px] md:h-[260px] relative">
              <svg viewBox="0 0 800 200" className="w-full h-full preserve-3d overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4182FF" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#4182FF" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <line x1="0" y1="180" x2="800" y2="180" stroke="#f1f5f9" strokeWidth="1.5" />
                <line x1="0" y1="135" x2="800" y2="135" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="6 6" />
                <line x1="0" y1="90" x2="800" y2="90" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="6 6" />
                <line x1="0" y1="45" x2="800" y2="45" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="6 6" />
                <line x1="0" y1="0" x2="800" y2="0" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="6 6" />
                
                <path d={pathData} fill="none" stroke="#4182FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d={fillData} fill="url(#colorBlue)" />
              </svg>
              <div className="absolute bottom-0 left-0 w-full flex justify-between pt-2 px-1 text-[10px] md:text-xs text-gray-400 font-medium tracking-tighter sm:tracking-normal">
                {chartData.map((d, i) => <span key={i} className="flex-1 text-center">{formatSysDate(d.time)}</span>)}
              </div>
              <div className="absolute top-0 left-0 h-full flex flex-col justify-between pb-[18px] pr-2 text-[10px] md:text-xs text-gray-400 font-medium -translate-x-full pr-3">
                <span>12</span><span>9</span><span>6</span><span>3</span><span>0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Aksi Cepat */}
        <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-[#0c5132] font-extrabold text-sm md:text-lg mb-4 md:mb-6">Aksi Cepat</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Tambah Paket */}
            <Link href="/dashboard-admin/add-package" className="bg-[#eaf9eb] rounded-[20px] flex flex-col items-center justify-center p-5 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-green-100">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-[#24a173] flex items-center justify-center mb-3 text-[#24a173]">
                <CubeIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
              </div>
              <span className="text-[#0c5132] font-extrabold text-xs md:text-sm">Tambah Paket</span>
            </Link>
            
            {/* Kelola User */}
            <Link href="/dashboard-admin/users" className="bg-[#eef4fc] rounded-[20px] flex flex-col items-center justify-center p-5 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-blue-100">
               <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-[#4182FF] flex items-center justify-center mb-3 text-[#4182FF]">
                <UsersIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
              </div>
              <span className="text-[#0c5132] font-extrabold text-xs md:text-sm">Kelola User</span>
            </Link>

            {/* Laporan */}
            <Link href="/dashboard-admin/laporan-kinerja" className="bg-[#effef1] rounded-[20px] flex flex-col items-center justify-center p-5 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-emerald-100">
               <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-[#4dc567] flex items-center justify-center mb-3 text-[#4dc567]">
                <ChartBarIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
              </div>
              <span className="text-[#0c5132] font-extrabold text-xs md:text-sm">Laporan</span>
            </Link>

            {/* Keluhan */}
            <Link href="#" className="bg-[#fff1eb] rounded-[20px] flex flex-col items-center justify-center p-5 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-orange-100">
               <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-[#ff6b35] flex items-center justify-center mb-3 text-[#ff6b35]">
                <ExclamationCircleIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
              </div>
              <span className="text-[#0c5132] font-extrabold text-xs md:text-sm">Keluhan</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

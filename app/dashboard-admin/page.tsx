'use client';

import { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import {
  Bars3Icon,
  UsersIcon,
  CubeIcon,
  TruckIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { 
  getUserStats, 
  fetchLaporanStats, 
  fetchDailyPackageVolumeByStatus, 
  fetchDailyRevenue 
} from '@/app/lib/actions';
import AdminSidebar from '@/app/ui/dashboard/admin-sidebar';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

function formatRupiahShort(val: number): string {
  if (val >= 1000000) {
    return 'Rp ' + (val / 1000000).toFixed(1) + ' jt';
  }
  if (val >= 1000) {
    return 'Rp ' + (val / 1000).toFixed(0) + ' k';
  }
  return 'Rp ' + val;
}

function formatDateLabel(dateStr: string): string {
  if (!dateStr) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function buildSmoothPath(
  data: number[],
  svgW: number,
  svgH: number,
  maxVal: number,
): { line: string; fill: string } {
  if (data.length === 0) return { line: '', fill: '' };
  const padT = 10, padB = 10;
  const h = svgH - padT - padB;
  const colW = svgW / data.length;
  const getY = (v: number) => padT + h - (maxVal > 0 ? (v / maxVal) * h : 0);
  const pts = data.map((v, i) => ({ x: i * colW + colW / 2, y: getY(v) }));
  let line = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cx1 = pts[i - 1].x + colW * 0.45;
    const cy1 = pts[i - 1].y;
    const cx2 = pts[i].x - colW * 0.45;
    const cy2 = pts[i].y;
    line += ` C${cx1},${cy1} ${cx2},${cy2} ${pts[i].x},${pts[i].y}`;
  }
  const fill = line + ` L${pts[pts.length - 1].x},${svgH} L${pts[0].x},${svgH} Z`;
  return { line, fill };
}

export default function DashboardAdmin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalPaket: 0,
    dalamProses: 0,
    selesai: 0,
  });
  const [packageVolumeByStatus, setPackageVolumeByStatus] = useState<{ date: string; sukses: number; proses: number; batal: number }[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<{ date: string; revenue: number }[]>([]);
  const [activeVolIndex, setActiveVolIndex] = useState<number | null>(null);
  const [activeRevIndex, setActiveRevIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userStats, laporanStats, volByStatus, rev] = await Promise.all([
          getUserStats(),
          fetchLaporanStats(),
          fetchDailyPackageVolumeByStatus(7),
          fetchDailyRevenue(7),
        ]);
        setStats({
          totalCustomers: userStats.totalCustomers,
          totalPaket: laporanStats.totalPaket,
          dalamProses: laporanStats.dalamProses,
          selesai: laporanStats.selesai,
        });
        setPackageVolumeByStatus(volByStatus);
        setDailyRevenue(rev);
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
    const interval = setInterval(loadData, 120000); 
    
    return () => clearInterval(interval);
  }, []);

  const SVG_W = 800;
  const SVG_H = 180;

  // Chart 1 (Package Volume by Status)
  const maxVol = Math.max(
    ...packageVolumeByStatus.map(d => Math.max(d.sukses, d.proses, d.batal)),
    1
  );
  
  const { line: suksesLine, fill: suksesFill } = buildSmoothPath(
    packageVolumeByStatus.map(d => d.sukses),
    SVG_W,
    SVG_H,
    maxVol
  );
  const { line: prosesLine, fill: prosesFill } = buildSmoothPath(
    packageVolumeByStatus.map(d => d.proses),
    SVG_W,
    SVG_H,
    maxVol
  );
  const { line: batalLine, fill: batalFill } = buildSmoothPath(
    packageVolumeByStatus.map(d => d.batal),
    SVG_W,
    SVG_H,
    maxVol
  );
  
  const volYLabels = [maxVol, Math.round(maxVol * 0.75), Math.round(maxVol * 0.5), Math.round(maxVol * 0.25), 0];

  // Chart 2 (Daily Revenue Bar Chart)
  const revValues = dailyRevenue.map((d) => d.revenue);
  const maxRev = Math.max(...revValues, 100000);
  const revYLabels = [
    formatRupiahShort(maxRev),
    formatRupiahShort(maxRev * 0.75),
    formatRupiahShort(maxRev * 0.5),
    formatRupiahShort(maxRev * 0.25),
    'Rp 0'
  ];

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
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-400 font-semibold mb-1 tracking-wide">Total Pengguna</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-[#0c5132]">{stats.totalCustomers}</h3>
            </div>
          </div>

          {/* Card 2: Total Pengiriman */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:border-green-100">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-[#24a173] text-white p-3 md:p-3.5 rounded-[14px] shadow-sm">
                <CubeIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
              </div>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-400 font-semibold mb-1 tracking-wide">Total Pengiriman</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-[#0c5132]">{stats.totalPaket}</h3>
            </div>
          </div>

          {/* Card 3: Dalam Pengiriman */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:border-orange-100">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-[#F8A000] text-white p-3 md:p-3.5 rounded-[14px] shadow-sm">
                <TruckIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
              </div>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-400 font-semibold mb-1 tracking-wide">Dalam Pengiriman</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-[#0c5132]">{stats.dalamProses}</h3>
            </div>
          </div>

          {/* Card 4: Selesai */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:border-emerald-100">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-[#1b8555] text-white p-3 md:p-3.5 rounded-[14px] shadow-sm">
                <CheckCircleIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
              </div>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-400 font-semibold mb-1 tracking-wide">Selesai</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-[#0c5132]">{stats.selesai}</h3>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="flex flex-col gap-6 md:gap-8 mb-8">
          {/* Chart 1: Tren Pengiriman */}
          <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <CubeIcon className="w-5 h-5 md:w-6 md:h-6 text-[#24a173]" strokeWidth={2} />
                <h3 className="font-extrabold text-[#0c5132] text-sm md:text-lg">Tren Pengiriman (7 Hari Terakhir)</h3>
              </div>
              <div className="flex items-center gap-4 flex-wrap text-xs font-bold">
                <span className="flex items-center gap-1.5 text-[#24a173]">
                  <span className="w-3 h-3 bg-[#24a173] rounded-full"></span> Sukses
                </span>
                <span className="flex items-center gap-1.5 text-[#f59e0b]">
                  <span className="w-3 h-3 bg-[#f59e0b] rounded-full"></span> Proses
                </span>
                <span className="flex items-center gap-1.5 text-[#ef4444]">
                  <span className="w-3 h-3 bg-[#ef4444] rounded-full"></span> Batal
                </span>
              </div>
            </div>
            <div className="relative w-full" style={{ height: 220 }}>
              <div className="absolute left-0 top-0 h-[180px] flex flex-col justify-between text-[10px] md:text-xs text-gray-400 font-semibold w-8 text-right pr-2">
                {volYLabels.map((v, i) => <span key={i}>{v}</span>)}
              </div>
              <div className="absolute left-10 right-0 top-0 h-[180px] border-l border-b border-gray-200 relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3].map((i) => <div key={i} className="w-full border-t border-gray-100 border-dashed h-0" />)}
                  <div className="w-full h-0" />
                </div>
                <svg viewBox="0 0 800 180" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#24a173" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#24a173" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  
                  {/* Sukses */}
                  {suksesFill && <path d={suksesFill} fill="url(#colorGreen)" />}
                  {suksesLine && <path d={suksesLine} fill="none" stroke="#24a173" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
                  
                  {/* Proses */}
                  {prosesFill && <path d={prosesFill} fill="url(#colorOrange)" />}
                  {prosesLine && <path d={prosesLine} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
                  
                  {/* Batal */}
                  {batalFill && <path d={batalFill} fill="url(#colorRed)" />}
                  {batalLine && <path d={batalLine} fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

                  {/* Guide Line */}
                  {activeVolIndex !== null && (
                    <line
                      x1={activeVolIndex * (800 / 7) + (800 / 7) / 2}
                      y1={0}
                      x2={activeVolIndex * (800 / 7) + (800 / 7) / 2}
                      y2={180}
                      stroke="#cbd5e1"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      pointerEvents="none"
                    />
                  )}

                  {/* Highlight Circles */}
                  {activeVolIndex !== null && packageVolumeByStatus[activeVolIndex] && (
                    <g pointerEvents="none">
                      <circle
                        cx={activeVolIndex * (800 / 7) + (800 / 7) / 2}
                        cy={10 + 160 - (maxVol > 0 ? (packageVolumeByStatus[activeVolIndex].sukses / maxVol) * 160 : 0)}
                        r={6}
                        fill="#24a173"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                      <circle
                        cx={activeVolIndex * (800 / 7) + (800 / 7) / 2}
                        cy={10 + 160 - (maxVol > 0 ? (packageVolumeByStatus[activeVolIndex].proses / maxVol) * 160 : 0)}
                        r={6}
                        fill="#f59e0b"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                      <circle
                        cx={activeVolIndex * (800 / 7) + (800 / 7) / 2}
                        cy={10 + 160 - (maxVol > 0 ? (packageVolumeByStatus[activeVolIndex].batal / maxVol) * 160 : 0)}
                        r={6}
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    </g>
                  )}

                  {/* Hover Trigger Rects */}
                  {packageVolumeByStatus.map((d, i) => {
                    const colW = 800 / 7;
                    const x = i * colW;
                    return (
                      <rect
                        key={i}
                        x={x}
                        y={0}
                        width={colW}
                        height={180}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setActiveVolIndex(i)}
                        onMouseLeave={() => setActiveVolIndex(null)}
                      />
                    );
                  })}
                </svg>
                {/* x-axis labels */}
                <div className="absolute -bottom-6 left-0 w-full flex justify-between text-[10px] md:text-xs text-gray-400 font-medium">
                  {packageVolumeByStatus.map((d, i) => <span key={i} className="flex-1 text-center">{formatDateLabel(d.date)}</span>)}
                </div>

                {/* Tooltip */}
                {activeVolIndex !== null && packageVolumeByStatus[activeVolIndex] && (
                  <div 
                    className="absolute bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-[10px] md:text-xs flex flex-col gap-1.5 z-30 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95 duration-100"
                    style={{
                      left: `${(activeVolIndex * (100 / 7)) + (100 / 7) / 2}%`,
                      top: '0%',
                      transform: 'translate(-50%, -100%)',
                      marginTop: '-12px'
                    }}
                  >
                    <p className="font-extrabold text-slate-300 border-b border-slate-700/60 pb-1 mb-1 whitespace-nowrap text-center">
                      {formatDateLabel(packageVolumeByStatus[activeVolIndex].date)}
                    </p>
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 font-semibold text-emerald-400">
                        <span className="w-2 h-2 bg-[#24a173] rounded-full inline-block"></span>
                        Sukses: {packageVolumeByStatus[activeVolIndex].sukses}
                      </span>
                      <span className="flex items-center gap-2 font-semibold text-amber-400">
                        <span className="w-2 h-2 bg-[#f59e0b] rounded-full inline-block"></span>
                        Proses: {packageVolumeByStatus[activeVolIndex].proses}
                      </span>
                      <span className="flex items-center gap-2 font-semibold text-rose-400">
                        <span className="w-2 h-2 bg-[#ef4444] rounded-full inline-block"></span>
                        Batal: {packageVolumeByStatus[activeVolIndex].batal}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chart 2: Pendapatan Harian */}
          <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <BanknotesIcon className="w-5 h-5 md:w-6 md:h-6 text-[#1b8555]" strokeWidth={2} />
                <h3 className="font-extrabold text-[#0c5132] text-sm md:text-lg">Pendapatan Harian (7 Hari Terakhir)</h3>
              </div>
              <span className="bg-[#e6fce5] text-[#1b8555] text-[10px] md:text-xs font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full flex items-center gap-2 shadow-sm border border-emerald-50">
                <span className="w-2 h-2 bg-[#1b8555] rounded-full inline-block animate-pulse"></span>
                Aktif
              </span>
            </div>
            <div className="relative w-full" style={{ height: 220 }}>
              <div className="absolute left-0 top-0 h-[180px] flex flex-col justify-between text-[10px] md:text-xs text-gray-400 font-semibold w-14 text-right pr-2">
                {revYLabels.map((v, i) => <span key={i}>{v}</span>)}
              </div>
              <div className="absolute left-16 right-0 top-0 h-[180px] border-l border-b border-gray-200 relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3].map((i) => <div key={i} className="w-full border-t border-gray-100 border-dashed h-0" />)}
                  <div className="w-full h-0" />
                </div>
                <svg viewBox="0 0 800 180" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1b8555" stopOpacity={0.95}/>
                      <stop offset="95%" stopColor="#24a173" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  
                  {dailyRevenue.map((d, i) => {
                    const colW = 800 / 7;
                    const w = 44;
                    const x = i * colW + (colW - w) / 2;
                    const barH = maxRev > 0 ? (d.revenue / maxRev) * 150 : 0;
                    const y = 180 - barH;
                    const isActive = activeRevIndex === i;
                    return (
                      <g key={i}>
                        <rect 
                          x={x}
                          y={y}
                          width={w}
                          height={barH}
                          fill="url(#colorRevenue)"
                          opacity={activeRevIndex === null || isActive ? 1 : 0.6}
                          rx={6}
                          className="cursor-pointer transition-all duration-200"
                          onMouseEnter={() => setActiveRevIndex(i)}
                          onMouseLeave={() => setActiveRevIndex(null)}
                        />
                        {d.revenue > 0 && !isActive && (
                          <text
                            x={x + w / 2}
                            y={y - 6}
                            textAnchor="middle"
                            className="text-[9px] md:text-[11px] font-extrabold fill-[#0b5131]"
                          >
                            {formatRupiahShort(d.revenue)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
                {/* x-axis labels */}
                <div className="absolute -bottom-6 left-0 w-full flex justify-between text-[10px] md:text-xs text-gray-400 font-medium">
                  {dailyRevenue.map((d, i) => <span key={i} className="flex-1 text-center">{formatDateLabel(d.date)}</span>)}
                </div>

                {/* Tooltip */}
                {activeRevIndex !== null && dailyRevenue[activeRevIndex] && (
                  <div 
                    className="absolute bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-[10px] md:text-xs flex flex-col gap-1.5 z-30 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95 duration-100"
                    style={{
                      left: `${(activeRevIndex * (100 / 7)) + (100 / 7) / 2}%`,
                      top: '0%',
                      transform: 'translate(-50%, -100%)',
                      marginTop: '-12px'
                    }}
                  >
                    <p className="font-extrabold text-slate-300 border-b border-slate-700/60 pb-1 mb-1 whitespace-nowrap text-center">
                      {formatDateLabel(dailyRevenue[activeRevIndex].date)}
                    </p>
                    <span className="font-bold text-emerald-400 text-center block whitespace-nowrap">
                      Rp {dailyRevenue[activeRevIndex].revenue.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Aksi Cepat */}
        <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-[#0c5132] font-extrabold text-sm md:text-lg mb-4 md:mb-6">Aksi Cepat</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            {/* Tambah Paket */}
            <Link href="/dashboard-admin/add-package" className="bg-[#eaf9eb] rounded-[20px] flex flex-col items-center justify-center p-5 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-green-100">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-[#24a173] flex items-center justify-center mb-3 text-[#24a173]">
                <CubeIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
              </div>
              <span className="text-[#0c5132] font-extrabold text-xs md:text-sm">Tambah Paket</span>
            </Link>

            {/* Kelola Paket */}
            <Link href="/dashboard-admin/packages" className="bg-[#fff8eb] rounded-[20px] flex flex-col items-center justify-center p-5 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-amber-100">
               <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-[#f59e0b] flex items-center justify-center mb-3 text-[#f59e0b]">
                <TruckIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
              </div>
              <span className="text-[#0c5132] font-extrabold text-xs md:text-sm">Kelola Paket</span>
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
            <Link href="/dashboard-admin/complaints" className="bg-[#fff1eb] rounded-[20px] flex flex-col items-center justify-center p-5 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-orange-100">
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

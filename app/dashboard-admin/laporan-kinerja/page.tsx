'use client';

import { useState, useEffect, useCallback } from 'react';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import {
  Bars3Icon,
  CubeIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  TruckIcon,
  BanknotesIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { ChartBarIcon as ChartBarSolidIcon } from '@heroicons/react/24/solid';
import AdminSidebar from '@/app/ui/dashboard/admin-sidebar';
import {
  fetchLaporanStats,
  fetchDailyRevenue,
  fetchDailyPackageVolume,
} from '@/app/lib/actions';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

function formatDateLabel(dateStr: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function formatRupiah(val: number): string {
  if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)}jt`;
  if (val >= 1_000) return `Rp ${(val / 1_000).toFixed(0)}k`;
  return `Rp ${val}`;
}

function formatRupiahFull(val: number): string {
  return 'Rp ' + val.toLocaleString('id-ID');
}



export default function LaporanKinerja() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [stats, setStats] = useState({
    totalPaket: 0, selesai: 0, dalamProses: 0,
    revenueThisMonth: 0, revenueLastMonth: 0, percentChange: 0,
  });
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number }[]>([]);
  const [volumeData, setVolumeData] = useState<{ date: string; count: number }[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [s, rev, vol] = await Promise.all([
        fetchLaporanStats(),
        fetchDailyRevenue(7),
        fetchDailyPackageVolume(7),
      ]);
      setStats(s);
      setRevenueData(rev);
      setVolumeData(vol);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  const revValues = revenueData.map((d) => d.revenue);
  const maxRev = Math.max(...revValues, 1);

  const volValues = volumeData.map((d) => d.count);
  const maxVol = Math.max(...volValues, 1);

  const revStep = maxRev / 4;
  const revYLabels = [maxRev, revStep * 3, revStep * 2, revStep, 0].map((v) => formatRupiah(v));

  const pct = stats.percentChange;
  const pctLabel = pct > 0 ? `+${pct}% dari bulan lalu` : pct < 0 ? `${pct}% dari bulan lalu` : 'Sama seperti bulan lalu';
  const pctColor = pct >= 0 ? 'bg-[#bbf7d0] text-[#166534]' : 'bg-red-100 text-red-700';
  const nowLabel = lastUpdated ? lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '...';

  return (
    <div className={`min-h-screen bg-[#f4fcf7] pb-16 ${poppins.className}`}>
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <nav className="flex items-center px-6 md:px-10 py-4 w-full bg-[#f4fcf7] sticky top-0 z-50">
        <button onClick={() => setIsSidebarOpen(true)} className="mr-5 text-[#24a173] hover:bg-[#e6fce5] p-2 rounded-lg transition-colors">
          <Bars3Icon className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-[#e6fce5] p-2.5 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-center">
            <CubeIcon className="w-6 h-6 text-[#1b8555] stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-extrabold text-[#0c5132] tracking-tight block leading-none mb-0.5">KirimAja</span>
            <span className="text-[11px] md:text-xs text-[#24a173] font-bold uppercase tracking-wider block">Admin</span>
          </div>
        </div>
      </nav>

      <div className="px-6 md:px-10 max-w-screen-xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <Link href="/dashboard-admin" className="p-2 hover:bg-[#e6fce5] rounded-full transition-colors text-[#24a173]">
              <ArrowLeftIcon className="w-5 h-5" strokeWidth={2.5} />
            </Link>
            <div>
              <h1 className="text-lg md:text-xl font-extrabold text-[#0c5132]">Laporan Kinerja 📊</h1>
              <p className="text-xs text-gray-500 font-medium">Analisa performa KirimAja · Diperbarui pukul {nowLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadData} disabled={isLoading} className="text-[#24a173] hover:bg-[#e6fce5] p-2 rounded-full transition-colors" title="Segarkan">
              <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={2.5} />
            </button>
            <button className="bg-[#24a173] hover:bg-[#1b8555] text-white text-[10px] md:text-xs font-semibold py-2 px-3 rounded-full flex items-center gap-1.5 shadow-sm transition-colors">
              <ArrowDownTrayIcon className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Unduh Laporan</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64 gap-3">
            <ArrowPathIcon className="w-7 h-7 text-[#24a173] animate-spin" />
            <span className="text-[#0c5132] font-bold">Memuat data...</span>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="bg-[#e6fce5] p-3 rounded-2xl"><CubeIcon className="w-6 h-6 text-[#24a173]" strokeWidth={2} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total Paket</p>
                  <h3 className="text-3xl font-black text-[#0c5132]">{stats.totalPaket}</h3>
                </div>
              </div>
              <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="bg-emerald-50 p-3 rounded-2xl"><CheckCircleIcon className="w-6 h-6 text-emerald-500" strokeWidth={2} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Selesai</p>
                  <h3 className="text-3xl font-black text-[#0c5132]">{stats.selesai}</h3>
                </div>
              </div>
              <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="bg-amber-50 p-3 rounded-2xl"><TruckIcon className="w-6 h-6 text-amber-500" strokeWidth={2} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Dalam Proses</p>
                  <h3 className="text-3xl font-black text-[#0c5132]">{stats.dalamProses}</h3>
                </div>
              </div>
            </div>

            {/* Pendapatan Bulan Ini */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-[#24a173]">
                <BanknotesIcon className="w-4 h-4" strokeWidth={2} />
                <h2 className="font-bold text-xs md:text-sm text-[#0c5132]">Pendapatan Bulan Ini</h2>
              </div>
              <div className="bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0] rounded-[20px] p-6 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute right-4 top-4">
                  <span className="flex items-center gap-1.5 bg-white/60 backdrop-blur text-[10px] font-bold text-[#1b8555] px-2 py-1 rounded-full border border-white/80">
                    <span className="w-1.5 h-1.5 bg-[#24a173] rounded-full animate-pulse inline-block" />
                    Aktif
                  </span>
                </div>
                <p className="text-[10px] md:text-xs text-gray-500 font-medium mb-1">Total Pendapatan Bulan Ini</p>
                <h3 className="text-2xl md:text-4xl font-extrabold text-[#0c5132] mb-3">{formatRupiahFull(stats.revenueThisMonth)}</h3>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${pctColor}`}>{pctLabel}</span>
                {stats.revenueLastMonth > 0 && (
                  <p className="text-[10px] text-gray-400 font-medium mt-2">Bulan lalu: {formatRupiahFull(stats.revenueLastMonth)}</p>
                )}
              </div>
            </div>

            {/* Bar Chart: Tren Pendapatan */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-[#24a173]">
                  <ChartBarSolidIcon className="w-4 h-4" />
                  <h2 className="font-bold text-xs md:text-sm text-[#0c5132]">Tren Pendapatan Harian (7 Hari Terakhir)</h2>
                </div>
                <span className="flex items-center gap-1.5 bg-[#e6fce5] text-[10px] font-bold text-[#24a173] px-2 py-1 rounded-full border border-emerald-50">
                  <span className="w-1.5 h-1.5 bg-[#24a173] rounded-full animate-pulse inline-block" />
                  Aktif
                </span>
              </div>

              <div className="relative w-full" style={{ height: 220 }}>
                <div className="absolute left-0 top-0 h-[180px] flex flex-col justify-between text-[9px] md:text-[11px] text-gray-400 font-semibold w-12 text-right pr-2">
                  {revYLabels.map((l, i) => <span key={i}>{l}</span>)}
                </div>
                <div className="absolute left-14 right-0 top-0 h-[180px] border-l border-b border-gray-200 flex items-end justify-around px-2">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2, 3].map((i) => <div key={i} className="w-full border-t border-gray-100 border-dashed h-0" />)}
                    <div className="w-full h-0" />
                  </div>
                  {revenueData.map((d, i) => {
                    const heightPct = maxRev > 0 ? (d.revenue / maxRev) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-0 relative group" style={{ maxWidth: 48 }}>
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#0c5132] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-md">
                          {formatRupiahFull(d.revenue)}
                        </div>
                        <div className="w-full max-w-[28px] md:max-w-[40px] rounded-t-xl transition-all duration-700"
                          style={{ 
                            height: `${Math.max(heightPct, 6)}%`, 
                            background: d.revenue === 0 ? '#cbd5e1' : 'linear-gradient(180deg, #24a173 0%, #1b8555 100%)' 
                          }} 
                        />
                      </div>
                    );
                  })}
                  <div className="absolute -bottom-6 left-0 w-full flex justify-between text-[9px] md:text-[11px] text-gray-400 font-semibold">
                    {revenueData.map((d, i) => <span key={i} className="flex-1 text-center">{formatDateLabel(d.date)}</span>)}
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center mt-10 gap-2 text-[10px] font-bold text-[#24a173]">
                <div className="w-2.5 h-2.5 bg-[#24a173] rounded-[3px]" />
                <span>Pendapatan</span>
              </div>
            </div>

            {/* Bar Chart: Volume Paket */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-[#24a173]">
                  <ChartBarSolidIcon className="w-4 h-4" />
                  <h2 className="font-bold text-xs md:text-sm text-[#0c5132]">Volume Paket Harian (7 Hari Terakhir)</h2>
                </div>
                <span className="flex items-center gap-1.5 bg-[#e6fce5] text-[10px] font-bold text-[#24a173] px-2 py-1 rounded-full border border-emerald-50">
                  <span className="w-1.5 h-1.5 bg-[#24a173] rounded-full animate-pulse inline-block" />
                  Aktif
                </span>
              </div>
              <div className="relative w-full" style={{ height: 220 }}>
                <div className="absolute left-0 top-0 h-[180px] flex flex-col justify-between text-[9px] md:text-[11px] text-gray-400 font-semibold w-6 text-right">
                  {[maxVol, Math.round(maxVol * 0.75), Math.round(maxVol * 0.5), Math.round(maxVol * 0.25), 0].map((v, i) => <span key={i}>{v}</span>)}
                </div>
                <div className="absolute left-10 right-0 top-0 h-[180px] border-l border-b border-gray-200 flex items-end justify-around px-2">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2, 3].map((i) => <div key={i} className="w-full border-t border-gray-100 border-dashed h-0" />)}
                    <div className="w-full h-0" />
                  </div>
                  {volumeData.map((d, i) => {
                    const heightPct = maxVol > 0 ? (d.count / maxVol) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-0 relative group" style={{ maxWidth: 48 }}>
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#0c5132] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-md">
                          {d.count} paket
                        </div>
                        <div className="w-full max-w-[28px] md:max-w-[40px] rounded-t-xl transition-all duration-700"
                          style={{ 
                            height: `${Math.max(heightPct, 6)}%`, 
                            background: d.count === 0 ? '#cbd5e1' : 'linear-gradient(180deg, #24a173 0%, #1b8555 100%)' 
                          }} 
                        />
                      </div>
                    );
                  })}
                  <div className="absolute -bottom-6 left-0 w-full flex justify-around text-[9px] md:text-[11px] text-gray-400 font-semibold">
                    {volumeData.map((d, i) => <span key={i} className="flex-1 text-center">{formatDateLabel(d.date)}</span>)}
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center mt-10 gap-2 text-[10px] font-bold text-[#24a173]">
                <div className="w-2.5 h-2.5 bg-[#24a173] rounded-[3px]" />
                <span>Jumlah Paket</span>
              </div>
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
                  <span className="text-sm font-extrabold text-[#0c5132]">{stats.totalPaket}</span>
                </div>
                <div className="bg-[#dcfce7] rounded-xl p-3 flex justify-between items-center">
                  <span className="text-xs font-semibold text-[#0c5132]">Selesai</span>
                  <span className="text-sm font-extrabold text-[#24a173]">{stats.selesai}</span>
                </div>
                <div className="bg-[#dcfce7] rounded-xl p-3 flex justify-between items-center">
                  <span className="text-xs font-semibold text-[#0c5132]">Dalam Proses</span>
                  <span className="text-sm font-extrabold text-amber-500">{stats.dalamProses}</span>
                </div>
                <div className="bg-[#f0fdf4] rounded-xl p-3 flex justify-between items-center border border-emerald-50">
                  <span className="text-xs font-semibold text-[#0c5132]">Total Pendapatan (bulan ini + bulan lalu)</span>
                  <span className="text-sm font-extrabold text-[#1b8555]">{formatRupiahFull(stats.revenueThisMonth + stats.revenueLastMonth)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

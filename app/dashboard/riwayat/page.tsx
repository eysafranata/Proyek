'use client';

import { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import {
  Bars3Icon,
  ArrowLeftIcon,
  InboxIcon,
  CubeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import Sidebar from '@/components/Sidebar';
import { fetchMyPackages } from '@/app/lib/actions';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function RiwayatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    async function loadPackages() {
      const data = await fetchMyPackages();
      if (data) {
        setPackages(data);
      }
    }
    loadPackages();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className={`min-h-screen bg-[#f4fcf7] pb-20 ${poppins.className}`}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Top Navbar */}
      <nav className="bg-white flex items-center px-6 md:px-10 py-5 sticky top-0 z-50 shadow-sm border-b border-gray-100 w-full">
        <button onClick={() => setIsSidebarOpen(true)} className="mr-4 hover:bg-gray-100 p-2 rounded-lg transition-colors">
          <Bars3Icon className="w-6 h-6 text-gray-800" />
        </button>
        <div className="flex items-center gap-3">
          <Image src="/logo1.jpeg" alt="Logo KirimAja" width={36} height={36} className="object-contain rounded" />
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-[#0c5132] tracking-tight leading-none">KirimAja</span>
            <span className="text-[10px] font-bold text-emerald-600">Riwayat Paket</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 mt-8 md:mt-12">
        <div className="mb-8 md:mb-12">
          <Link href="/dashboard" className="inline-flex items-center text-[#24a173] font-bold text-sm mb-4 hover:underline group">
            <ArrowLeftIcon className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0c5132] flex items-center gap-3">
            Riwayat Paket 📦
          </h1>
          <p className="text-gray-500 font-medium mt-1">Daftar semua paket yang pernah Anda kirim</p>
        </div>

        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-emerald-50 min-h-[400px]">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h3 className="font-extrabold text-[#0c5132] md:text-lg flex items-center gap-2">
              Semua Paket <span className="bg-emerald-50 text-[#24a173] px-3 py-1 rounded-full text-xs font-black">{packages.length}</span>
            </h3>
          </div>

          {packages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-[#f4fcf7] p-5 rounded-full mb-4 border-2 border-emerald-50">
                <InboxIcon className="w-12 h-12 text-[#24a173]/60" />
              </div>
              <h4 className="font-bold text-gray-700 text-base md:text-lg">Belum Ada Paket</h4>
              <p className="text-gray-400 text-sm mt-2 max-w-xs font-medium">Anda belum pernah melakukan pengiriman paket.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white border border-gray-100 rounded-[24px] p-5 shadow-sm transition-all hover:shadow-md hover:border-emerald-100 group flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="bg-[#f4fcf7] text-[#24a173] text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                          {pkg.type || 'Reguler'}
                        </span>
                        <h4 className="font-extrabold text-gray-800 text-lg mt-2 group-hover:text-[#24a173] transition-colors">{pkg.resi}</h4>
                      </div>
                      {pkg.status === 'Selesai' ? (
                        <span className="bg-[#e6fce5] text-emerald-600 border border-emerald-100 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                          Selesai
                        </span>
                      ) : (
                        <span className="bg-[#fff1eb] text-orange-500 border border-orange-100 text-[10px] font-extrabold px-2.5 py-1 rounded-full animate-pulse">
                          {pkg.status || 'Diproses'}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        <span>{pkg.origin} → {pkg.destination}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <CubeIcon className="w-4 h-4 text-gray-400" />
                        <span>{pkg.weight} kg • Rp {pkg.total_price?.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-medium mt-auto">
                    <span className="text-gray-400">Penerima:</span>
                    <span className="text-gray-700 font-bold">{pkg.receiver_name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

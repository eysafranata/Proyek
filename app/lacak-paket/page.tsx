'use client';

import { useState } from 'react';
import { Poppins } from 'next/font/google';
import Image from 'next/image';
import { 
  Bars3Icon, 
  MagnifyingGlassIcon,
  CubeIcon,
  ShareIcon,
  ArchiveBoxArrowDownIcon,
  CheckIcon,
  BoltIcon,
  MapPinIcon,
  StopCircleIcon
} from '@heroicons/react/24/outline';
import { TruckIcon } from '@heroicons/react/24/solid';
import Sidebar from '@/components/Sidebar';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export default function LacakPaket() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [resiInput, setResiInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleLacak = (e: React.FormEvent) => {
    e.preventDefault();
    if (resiInput.trim().toUpperCase() === 'CKL2026040001') {
      setShowResult(true);
      setNotFound(false);
    } else {
      setShowResult(false);
      setNotFound(true);
    }
  };

  return (
    <div className={`min-h-screen bg-[#f4fcf7] ${poppins.className} flex flex-col`}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Top Navbar */}
      <nav className="bg-white flex items-center px-6 md:px-10 py-5 sticky top-0 z-50 shadow-sm border-b border-gray-100 w-full flex-shrink-0">
        <button onClick={() => setIsSidebarOpen(true)} className="mr-4 hover:bg-gray-100 p-2 rounded-lg transition-colors">
          <Bars3Icon className="w-6 h-6 text-gray-800" />
        </button>
        <div className="flex items-center gap-3">
          <Image src="/logo1.jpeg" alt="Logo KirimAja" width={36} height={36} className="object-contain rounded" />
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-extrabold text-[#0c5132] tracking-tight leading-none">KirimAja</span>
            <span className="text-[10px] text-gray-500 font-medium">Pengiriman Terpercaya</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-screen-xl mx-auto px-6 md:px-12 xl:px-24 pt-10 md:pt-16 pb-20">
        
        {/* Header Title */}
        <div className="max-w-3xl mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">Lacak Paket</h1>
          <p className="text-gray-600 text-[15px] md:text-lg">
            Pantau perjalanan paket Anda secara real-time dengan presisi kinetik.
          </p>
        </div>

        {/* Search Bar aligned to left */}
        <form onSubmit={handleLacak} className="flex flex-col md:flex-row items-center gap-4 max-w-3xl mb-12">
          <div className="relative flex items-center w-full bg-white rounded-[24px] shadow-sm border border-gray-100 p-1 md:p-1.5 flex-1 transition-all">
            <div className="pl-4 md:pl-5 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 md:w-6 md:h-6 text-[#1db372]" strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="Masukkan Nomor Resi"
              value={resiInput}
              onChange={(e) => setResiInput(e.target.value)}
              className="flex-1 w-full py-3 md:py-4 px-4 bg-transparent outline-none border-none focus:ring-0 text-[#1db372] placeholder-gray-400 font-bold md:text-lg"
            />
            {/* If NOT showing result, the button is inside the input box on desktop/mobile mimicking the first image. 
                But in the new image, the button is outside. We will just put it outside if showResult is true, or keep it inside.
                Actually, the new image shows it completely outside. Let's adapt dynamically. */}
            {!showResult && (
              <button 
                type="submit"
                className="hidden md:flex bg-[#1db372] hover:bg-[#159a58] text-white px-6 md:px-8 py-3 rounded-[20px] font-bold text-sm md:text-base items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
              >
                Lacak <span>→</span>
              </button>
            )}
          </div>
          
          {/* Button Outside (Mobile & when result is shown) */}
          {(showResult || true) && (
            <button 
              type="submit"
              className={`${showResult ? 'flex' : 'flex md:hidden'} w-full md:w-auto bg-[#1db372] hover:bg-[#159a58] text-white px-8 md:px-10 py-4 md:py-[22px] rounded-[24px] font-bold text-sm md:text-base items-center justify-center gap-2 transition-colors shadow-sm whitespace-nowrap`}
            >
              Lacak <span>→</span>
            </button>
          )}
        </form>

        {/* Not Found View */}
        {notFound && !showResult && (
          <div className="max-w-3xl flex flex-col items-center justify-center bg-white border border-red-100 rounded-[24px] shadow-sm p-10 mb-8 animate-in fade-in">
            <div className="bg-red-50 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Resi tidak ditemukan</h3>
            <p className="text-gray-500 text-center text-sm">
              Mohon periksa kembali nomor resi yang Anda masukkan. Pastikan nomor resi tersebut sudah benar dan valid.
            </p>
          </div>
        )}

        {/* Tracking Result View */}
        {showResult && (
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start animate-in fade-in slide-in-from-bottom-8 duration-500">
            
            {/* Left Column: Status Pengiriman */}
            <div className="w-full lg:flex-[3] bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-emerald-50 relative">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-[18px] md:text-[22px] font-extrabold text-gray-900">Status Pengiriman</h2>
                <div className="bg-[#e2f6ea] text-[#139c5d] text-[10px] md:text-[12px] font-bold px-4 py-2 rounded-full tracking-widest uppercase">
                  Sedang Diantar
                </div>
              </div>

              {/* Timeline Container */}
              <div className="relative pl-4 md:pl-6 pb-4">
                {/* Vertical Line */}
                <div className="absolute left-[39px] md:left-[47px] top-6 bottom-6 w-[2px] bg-gray-100"></div>

                {/* Step 1: Paket Diterima (Future) */}
                <div className="flex items-start gap-4 md:gap-6 mb-10 relative z-10">
                  <div className="bg-[#f0f4f2] w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 border-white flex-shrink-0">
                    <CubeIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                  </div>
                  <div className="pt-1 md:pt-1.5 opacity-60">
                    <h3 className="font-bold text-gray-600 text-[15px] md:text-[17px]">Paket Diterima</h3>
                    <p className="text-gray-400 text-xs md:text-sm mt-0.5">Estimasi tiba hari ini</p>
                  </div>
                </div>

                {/* Step 2: Sedang Diantar (Current) */}
                <div className="flex items-start gap-4 md:gap-6 mb-10 relative z-10">
                  <div className="bg-[#1db372] w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 border-white flex-shrink-0 shadow-md shadow-[#1db372]/30">
                    <TruckIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="pt-1.5">
                    <h3 className="font-bold text-[#1db372] text-[15px] md:text-[17px]">Sedang Diantar</h3>
                    <p className="text-gray-600 text-xs md:text-sm mt-0.5 font-medium">Kurir: Budi Sudarsono sedang menuju alamat Anda</p>
                    <p className="text-[10px] md:text-xs text-gray-400 font-bold tracking-widest mt-2 uppercase">12 OKT 2026 • 10:45</p>
                  </div>
                </div>

                {/* Step 3: Sampai di Transit (Past) */}
                <div className="flex items-start gap-4 md:gap-6 mb-10 relative z-10">
                  <div className="bg-[#e4f7ec] w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 border-white flex-shrink-0">
                    <ShareIcon className="w-5 h-5 md:w-6 md:h-6 text-[#1db372]" />
                  </div>
                  <div className="pt-1.5">
                    <h3 className="font-bold text-gray-800 text-[15px] md:text-[17px]">Sampai di Transit</h3>
                    <p className="text-gray-500 text-xs md:text-sm mt-0.5">Gudang Sortir Bandung</p>
                    <p className="text-[10px] md:text-xs text-gray-400 font-bold tracking-widest mt-2 uppercase">12 OKT 2026 • 03:20</p>
                  </div>
                </div>

                {/* Step 4: Paket Dikirim (Past) */}
                <div className="flex items-start gap-4 md:gap-6 mb-10 relative z-10">
                  <div className="bg-[#e4f7ec] w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 border-white flex-shrink-0">
                    <ArchiveBoxArrowDownIcon className="w-5 h-5 md:w-6 md:h-6 text-[#1db372] transform rotate-180" />
                  </div>
                  <div className="pt-1.5">
                    <h3 className="font-bold text-gray-800 text-[15px] md:text-[17px]">Paket Dikirim</h3>
                    <p className="text-gray-500 text-xs md:text-sm mt-0.5">Berangkat dari hub asal Jakarta Pusat</p>
                    <p className="text-[10px] md:text-xs text-gray-400 font-bold tracking-widest mt-2 uppercase">11 OKT 2026 • 19:00</p>
                  </div>
                </div>

                {/* Step 5: Pesanan Diproses (Past) */}
                <div className="flex items-start gap-4 md:gap-6 relative z-10">
                  <div className="bg-[#e4f7ec] w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 border-white flex-shrink-0">
                    <CheckIcon className="w-5 h-5 md:w-6 md:h-6 text-[#1db372]" strokeWidth={3} />
                  </div>
                  <div className="pt-1.5">
                    <h3 className="font-bold text-gray-800 text-[15px] md:text-[17px]">Pesanan Diproses</h3>
                    <p className="text-gray-500 text-xs md:text-sm mt-0.5">Manifest dibuat oleh pengirim</p>
                    <p className="text-[10px] md:text-xs text-gray-400 font-bold tracking-widest mt-2 uppercase">11 OKT 2026 • 14:15</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Layanan & Bantuan */}
            <div className="w-full lg:flex-[2] flex flex-col gap-6 md:gap-8">
              
              {/* Card INFORMASI LAYANAN */}
              <div className="bg-[#f0f4f2] rounded-[32px] p-6 md:p-8">
                <h3 className="text-[11px] md:text-[13px] text-gray-400 font-bold tracking-widest uppercase mb-6">
                  Informasi Layanan
                </h3>

                <div className="flex justify-between items-center bg-white p-4 rounded-2xl mb-8 shadow-sm border border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#e4f7ec] text-[#1db372] flex items-center justify-center rounded-xl">
                      <BoltIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-[14px]">Layanan Express</h4>
                      <p className="text-[11px] text-gray-500">1-2 Hari Kerja</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Estimasi Tiba</p>
                    <p className="font-extrabold text-[#1db372] text-[14px] md:text-[15px]">12 Okt 2026</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Pengirim */}
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-1.5">
                      <StopCircleIcon className="w-4 h-4 text-[#1db372]" />
                      <p className="text-[11px] font-bold text-gray-400 tracking-wider">PENGIRIM</p>
                    </div>
                    <div className="pl-6 border-l-2 border-gray-200 ml-2 pb-6">
                      <p className="font-bold text-gray-900 text-[14px]">PT. Maju Mundur Sejahtera</p>
                      <p className="text-[13px] text-gray-500 mt-0.5">Jakarta Pusat</p>
                    </div>
                  </div>

                  {/* Penerima */}
                  <div className="relative -mt-6">
                    <div className="flex items-center gap-2 mb-1.5">
                      <MapPinIcon className="w-4 h-4 text-[#1db372]" />
                      <p className="text-[11px] font-bold text-gray-400 tracking-wider">PENERIMA</p>
                    </div>
                    <div className="pl-6 ml-2">
                      <p className="font-bold text-gray-900 text-[14px]">Bapak Ridwan Kamil</p>
                      <p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">
                        Jl. Dago No. 45, Bandung, Jawa Barat
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="w-full px-6 md:px-12 xl:px-24 py-8 border-t border-gray-200 bg-[#eaf4ef] flex flex-col sm:flex-row justify-between items-center text-[11px] md:text-[13px] text-gray-500 gap-4 flex-shrink-0 mt-8">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#0c5132] text-sm tracking-tight mr-1">KirimAja</span> | 
          <span className="ml-1">© 2026 KirimAja Logistics. All Rights Reserved.</span>
        </div>
        <div className="flex gap-6 font-medium">
          <a href="#" className="hover:text-[#1db372] transition-colors underline decoration-gray-300 underline-offset-4">Terms of Service</a>
          <a href="#" className="hover:text-[#1db372] transition-colors underline decoration-gray-300 underline-offset-4">Privacy Policy</a>
          <a href="#" className="hover:text-[#1db372] transition-colors underline decoration-gray-300 underline-offset-4">Contact Us</a>
        </div>
      </footer>

    </div>
  );
}

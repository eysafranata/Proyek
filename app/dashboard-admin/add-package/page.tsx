'use client';

import { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  PaperAirplaneIcon,
  CheckCircleIcon,
  XMarkIcon,
  InboxIcon,
  BanknotesIcon,
  ScaleIcon,
  ExclamationCircleIcon,
  Bars3Icon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { createPackage } from '@/app/lib/actions';
import AdminSidebar from '@/app/ui/dashboard/admin-sidebar';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function AddPackagePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    sender_name: '',
    receiver_name: '',
    origin: '',
    destination: '',
    weight: '',
    type: 'Reguler',
    payment_method: 'Tunai',
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);

  const pricePerKg = 10000;
  const totalPrice = parseFloat(formData.weight) ? parseFloat(formData.weight) * pricePerKg : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    let isValid = true;

    if (!formData.sender_name) newErrors.sender_name = true;
    if (!formData.receiver_name) newErrors.receiver_name = true;
    if (!formData.origin) newErrors.origin = true;
    if (!formData.destination) newErrors.destination = true;
    if (!formData.weight || parseFloat(formData.weight) <= 0) newErrors.weight = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShowErrorBanner(true);
      isValid = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowErrorBanner(false);
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    const result = await createPackage(data);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessData(result.package);
    } else {
      alert(result.error || 'Terjadi kesalahan saat menyimpan paket.');
    }
  };

  return (
    <div className={`min-h-screen bg-[#f4fcf7] pb-20 ${poppins.className}`}>
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {/* Navbar Minimalist */}
      <nav className="flex items-center px-6 md:px-10 py-6 w-full bg-transparent sticky top-0 z-50">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="mr-5 text-[#24a173] hover:bg-[#e6fce5] p-2 rounded-lg transition-colors"
        >
          <Bars3Icon className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-[#e6fce5] p-2 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-center">
            <CubeIcon className="w-6 h-6 text-[#1b8555] stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-extrabold text-[#0c5132] tracking-tight block leading-none mb-0.5">KirimAja</span>
            <span className="text-[11px] md:text-xs text-[#24a173] font-bold uppercase tracking-wider block">Admin</span>
          </div>
        </div>
      </nav>

      <div className="px-6 md:px-10 max-w-screen-xl mx-auto flex flex-col items-center">
        
        {/* Error Banner */}
        {showErrorBanner && (
          <div className="w-full max-w-3xl mb-8 animate-in slide-in-from-top duration-300">
             <div className="bg-white rounded-2xl shadow-lg border-l-4 border-black p-4 flex items-center gap-4">
                <ExclamationCircleIcon className="w-6 h-6 text-black" />
                <span className="font-bold text-gray-800 text-sm md:text-base">Mohon lengkapi data paket!</span>
             </div>
          </div>
        )}

        <div className="w-full max-w-3xl">
          <div className="mb-8 md:mb-10 text-center md:text-left">
            <Link href="/dashboard-admin" className="inline-flex items-center text-[#24a173] font-bold text-sm mb-4 hover:underline group">
              <ArrowLeftIcon className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Kembali
            </Link>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#0c5132] flex items-center justify-center md:justify-start gap-3">
              Tambah Paket Baru 📦
            </h1>
            <p className="text-gray-500 font-medium mt-1">Masukkan detail pengiriman baru</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-50">
            <div className="flex items-center gap-3 mb-8">
               <div className="bg-[#e6fce5] p-2 rounded-xl">
                 <InboxIcon className="w-5 h-5 text-[#24a173]" />
               </div>
               <h2 className="font-extrabold text-[#0c5132] md:text-lg">Detail Paket</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-10 md:gap-y-8">
              {/* Row 1 */}
              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Nomor Resi</label>
                <input 
                  type="text" 
                  placeholder="Otomatis digenerate" 
                  disabled
                  className="w-full px-5 py-4 bg-[#f8faf9] border-2 border-transparent rounded-2xl font-medium text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Nama Pengirim</label>
                <input 
                  type="text" 
                  name="sender_name"
                  placeholder="Contoh: Ira"
                  value={formData.sender_name}
                  onChange={handleInputChange}
                  className={`w-full px-5 py-4 bg-white border-2 rounded-2xl font-medium transition-all focus:ring-4 focus:ring-emerald-50 focus:outline-none ${errors.sender_name ? 'border-red-300' : 'border-[#e0e7e3] focus:border-[#24a173]'}`}
                />
              </div>

              {/* Row 2 */}
              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Nama Penerima</label>
                <input 
                  type="text" 
                  name="receiver_name"
                  placeholder="Contoh: Budi"
                  value={formData.receiver_name}
                  onChange={handleInputChange}
                  className={`w-full px-5 py-4 bg-white border-2 rounded-2xl font-medium transition-all focus:ring-4 focus:ring-emerald-50 focus:outline-none ${errors.receiver_name ? 'border-red-300' : 'border-[#e0e7e3] focus:border-[#24a173]'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Kota Asal</label>
                <input 
                  type="text" 
                  name="origin"
                  placeholder="Contoh: Semarang"
                  value={formData.origin}
                  onChange={handleInputChange}
                  className={`w-full px-5 py-4 bg-white border-2 rounded-2xl font-medium transition-all focus:ring-4 focus:ring-emerald-50 focus:outline-none ${errors.origin ? 'border-red-300' : 'border-[#e0e7e3] focus:border-[#24a173]'}`}
                />
              </div>

              {/* Row 3 */}
              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Kota Tujuan</label>
                <input 
                  type="text" 
                  name="destination"
                  placeholder="Contoh: Yogyakarta"
                  value={formData.destination}
                  onChange={handleInputChange}
                  className={`w-full px-5 py-4 bg-white border-2 rounded-2xl font-medium transition-all focus:ring-4 focus:ring-emerald-50 focus:outline-none ${errors.destination ? 'border-red-300' : 'border-[#e0e7e3] focus:border-[#24a173]'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Berat (Kg)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    name="weight"
                    placeholder="Contoh: 3"
                    step="0.1"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-4 bg-white border-2 rounded-2xl font-medium transition-all focus:ring-4 focus:ring-emerald-50 focus:outline-none pr-12 ${errors.weight ? 'border-red-300' : 'border-[#e0e7e3] focus:border-[#24a173]'}`}
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Kg</div>
                </div>
              </div>

              {/* Row 4 */}
              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Tipe Paket</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-[#f8faf9] border-2 border-transparent rounded-2xl font-medium text-[#0c5132] focus:ring-4 focus:ring-emerald-50 outline-none cursor-pointer"
                >
                  <option value="Reguler">Reguler</option>
                  <option value="Ekspres">Ekspres</option>
                  <option value="Kargo">Kargo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Metode Pembayaran</label>
                <select 
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-[#f8faf9] border-2 border-transparent rounded-2xl font-medium text-[#0c5132] focus:ring-4 focus:ring-emerald-50 outline-none cursor-pointer"
                >
                  <option value="Tunai">Tunai</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </div>
            </div>

            {/* Pricing Breakdown Box */}
            {totalPrice > 0 && (
              <div className="mt-12 md:mt-16 bg-[#e6f7ec] rounded-[32px] p-8 md:p-10 border border-emerald-100 animate-in fade-in slide-in-from-bottom duration-500">
                 <div className="flex items-center gap-3 mb-6">
                    <BanknotesIcon className="w-6 h-6 text-[#24a173]" />
                    <h3 className="font-extrabold text-[#0c5132] md:text-lg">Rincian Harga</h3>
                 </div>
                 <div className="space-y-3.5 border-b border-white/40 pb-5 mb-5 text-[#0c5132]/80 font-medium">
                    <div className="flex justify-between items-center">
                      <span>Tipe Paket:</span>
                      <span className="font-bold">{formData.type}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm md:text-base">
                      <span>Tarif per Kg:</span>
                      <span className="font-bold">Rp {pricePerKg.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm md:text-base">
                      <span>Berat:</span>
                      <span className="font-bold">{formData.weight} Kg</span>
                    </div>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#0c5132] text-lg">Total Harga:</span>
                    <span className="font-extrabold text-[#24a173] text-2xl md:text-3xl">Rp {totalPrice.toLocaleString('id-ID')}</span>
                 </div>

                 {/* QRIS Scan Section */}
                 {formData.payment_method === 'QRIS' && (
                   <div className="mt-8 flex flex-col items-center animate-in zoom-in duration-500">
                      <div className="bg-white p-4 rounded-3xl shadow-sm border border-emerald-50 mb-3">
                         <img 
                           src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=KirimAja_Payment" 
                           alt="QRIS Barcode" 
                           className="w-40 h-40 md:w-48 md:h-48 object-contain"
                         />
                      </div>
                      <span className="font-bold text-[#0c5132] text-sm md:text-base">Scan Barcode</span>
                   </div>
                 )}
              </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#24a173] text-white py-5 rounded-[24px] font-bold flex items-center justify-center gap-3 mt-10 md:mt-14 transition-all hover:bg-[#1b8555] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              {isSubmitting ? (
                 <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                  Simpan Paket
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal (Struk) */}
      {successData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-10 overflow-y-auto bg-[#0c5132]/20 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col p-8 md:p-10 animate-in zoom-in duration-500">
              <div className="flex flex-col items-center text-center mb-8">
                 <div className="w-16 h-16 bg-[#e6fce5] rounded-full flex items-center justify-center text-[#24a173] mb-4">
                    <CheckCircleIcon className="w-10 h-10 stroke-[2.5]" />
                 </div>
                 <h3 className="text-2xl font-extrabold text-[#0c5132] leading-tight">Pembayaran Berhasil</h3>
                 <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-widest">Transaction ID: {successData.resi}</p>
              </div>

              <div className="bg-[#f8faf9] rounded-3xl p-6 mb-8 border border-gray-50 flex flex-col gap-5">
                 <div className="flex items-start gap-4">
                    <div className="p-2 bg-white rounded-xl shadow-xs border border-gray-100 flex flex-col items-center">
                       <span className="w-2.5 h-2.5 bg-[#24a173] rounded-full mb-1"></span>
                       <div className="w-0.5 h-4 bg-gray-100 rounded-full"></div>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Pengirim</span>
                       <span className="font-extrabold text-[#0c5132] text-sm leading-tight">{successData.sender_name} <span className="text-gray-300 font-medium ml-1">· {successData.origin}</span></span>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="p-2 bg-white rounded-xl shadow-xs border border-gray-100 flex flex-col items-center">
                       <XMarkIcon className="w-3 h-3 text-orange-400 rotate-45" strokeWidth={3} />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Penerima</span>
                       <span className="font-extrabold text-[#0c5132] text-sm leading-tight">{successData.receiver_name} <span className="text-gray-300 font-medium ml-1">· {successData.destination}</span></span>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="flex flex-col bg-gray-50 p-3 rounded-2xl border border-white">
                   <span className="text-[9px] font-bold text-gray-400 uppercase mb-1">Tipe Paket</span>
                   <span className="text-[#24a173] font-extrabold text-xs">{successData.type}</span>
                </div>
                <div className="flex flex-col bg-gray-50 p-3 rounded-2xl border border-white">
                   <span className="text-[9px] font-bold text-gray-400 uppercase mb-1">Berat Total</span>
                   <span className="text-[#0c5132] font-extrabold text-xs">{successData.weight} Kg</span>
                </div>
                <div className="flex flex-col bg-gray-50 p-3 rounded-2xl border border-white">
                   <span className="text-[9px] font-bold text-gray-400 uppercase mb-1">Metode</span>
                   <span className="text-[#0c5132] font-extrabold text-xs">{successData.payment_method}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                 <div className="flex justify-between items-center text-xs font-bold text-[#0c5132]">
                    <span className="text-gray-400 uppercase tracking-wider">Tarif per Kg</span>
                    <span>Rp {(10000).toLocaleString('id-ID')}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs font-bold text-[#0c5132]">
                    <span className="text-gray-400 uppercase tracking-wider">Kuantitas</span>
                    <span>x {successData.weight} Kg</span>
                 </div>
                 <div className="h-px bg-gray-100 w-full my-2"></div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Pembayaran</span>
                    <span className="text-[#24a173] font-black text-xl">Rp {parseFloat(successData.total_price).toLocaleString('id-ID')}</span>
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                 <button 
                    onClick={() => window.print()}
                    className="w-full bg-[#24a173] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#1b8555] transition-all shadow-sm"
                 >
                    <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                    Download Struk
                 </button>
                 <button 
                    onClick={() => {
                        setSuccessData(null);
                        setFormData({
                          sender_name: '',
                          receiver_name: '',
                          origin: '',
                          destination: '',
                          weight: '',
                          type: 'Reguler',
                          payment_method: 'Tunai',
                        });
                    }}
                    className="w-full bg-[#f4fcf7] text-[#24a173] py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all border border-[#24a173]/10"
                 >
                    Selesai
                 </button>
              </div>

              <div className="mt-8 flex flex-col items-center text-center">
                 <span className="text-xl md:text-2xl font-extrabold text-[#0c5132] tracking-tight block leading-none scale-75 opacity-30">KirimAja</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

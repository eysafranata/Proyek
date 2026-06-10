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
import { createPackage, fetchVehicles } from '@/app/lib/actions';
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
    tanggal_kirim: '',
    no_telepon: '',
    jenis_barang: '',
    jenis_kendaraan: '',
    plat_kendaraan: '',
    deskripsi: '',
    kode_pos: '',
    alamat: '',
    total_price: '',
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [errorBannerMessage, setErrorBannerMessage] = useState('Mohon lengkapi data paket!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [resi, setResi] = useState('');

  let currentPricePerKg = 15000;
  if (formData.type === 'Express') currentPricePerKg = 25000;
  else if (formData.type === 'Cargo') currentPricePerKg = 50000;
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    async function loadVehicles() {
      const v = await fetchVehicles();
      setVehicles(v);
    }
    loadVehicles();

    // Generate resi otomatis saat halaman dibuka
    const generatedResi = `CKL${Date.now().toString().slice(-7)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    setResi(generatedResi);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'kendaraan_select') {
      const selected = vehicles.find(v => v.kode_kendaraan === value);
      if (selected) {
        setFormData(prev => ({
          ...prev,
          jenis_kendaraan: selected.jenis_kendaraan,
          plat_kendaraan: selected.kode_kendaraan
        }));
      }
      if (errors.jenis_kendaraan) {
        setErrors(prev => {
          const next = { ...prev };
          delete next.jenis_kendaraan;
          return next;
        });
      }
      return;
    }

    let val = value;
    if (name === 'no_telepon') {
      val = value.replace(/\D/g, '');
    }

    let updatedData = { ...formData, [name]: val };
    
    if (name === 'weight' || name === 'type') {
      const weightNum = parseFloat(name === 'weight' ? val : formData.weight);
      const currentType = name === 'type' ? val : formData.type;
      
      if (!isNaN(weightNum)) {
        let pricePerKg = 15000; // Reguler
        if (currentType === 'Express') pricePerKg = 25000;
        else if (currentType === 'Cargo') pricePerKg = 50000;
        
        updatedData.total_price = (weightNum * pricePerKg).toString();
      } else {
        updatedData.total_price = '';
      }
    }

    setFormData(updatedData);
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (name === 'sender_name') {
      setErrors(prev => {
        const next = { ...prev };
        delete next.sender_name;
        delete next.sender_not_found;
        return next;
      });
    }
    if (name === 'no_telepon') {
      setErrors(prev => {
        const next = { ...prev };
        delete next.no_telepon;
        delete next.no_telepon_length;
        return next;
      });
    }
    if (name === 'kode_pos') {
      setErrors(prev => {
        const next = { ...prev };
        delete next.kode_pos;
        delete next.kode_pos_format;
        return next;
      });
    }
    if (name === 'alamat') {
      setErrors(prev => {
        const next = { ...prev };
        delete next.alamat;
        return next;
      });
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
    if (!formData.tanggal_kirim) newErrors.tanggal_kirim = true;
    
    if (!formData.no_telepon) {
      newErrors.no_telepon = true;
    } else {
      const phoneDigits = formData.no_telepon.replace(/\D/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 12) {
        newErrors.no_telepon_length = true;
      }
    }
    
    if (!formData.jenis_barang) newErrors.jenis_barang = true;
    if (!formData.jenis_kendaraan) newErrors.jenis_kendaraan = true;
    
    if (!formData.kode_pos) {
      newErrors.kode_pos = true;
    }
    
    if (!formData.alamat) {
      newErrors.alamat = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setErrorBannerMessage('Mohon lengkapi data paket!');
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
    data.append('resi', resi);

    const result = await createPackage(data);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessData(result.package);
    } else {
      if (result.error && result.error.includes('tidak terdaftar')) {
        setErrors(prev => ({ ...prev, sender_name: true, sender_not_found: true }));
      }
      setErrorBannerMessage(result.error || 'Terjadi kesalahan saat menyimpan paket.');
      setShowErrorBanner(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
                <span className="font-bold text-gray-800 text-sm md:text-base">{errorBannerMessage}</span>
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
                  value={resi}
                  disabled
                  className="w-full px-5 py-4 bg-[#f8faf9] border-2 border-transparent rounded-2xl font-extrabold text-[#0c5132] cursor-not-allowed shadow-inner"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Tanggal Kirim</label>
                <input 
                  type="date" 
                  name="tanggal_kirim"
                  value={formData.tanggal_kirim}
                  onChange={handleInputChange}
                  className={`w-full px-5 py-4 bg-white border-2 rounded-2xl font-medium transition-all focus:ring-4 focus:ring-emerald-50 focus:outline-none ${errors.tanggal_kirim ? 'border-red-300' : 'border-[#e0e7e3] focus:border-[#24a173]'}`}
                />
              </div>

              {/* Row 2 */}
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
                {errors.sender_not_found && (
                  <p className="text-red-500 text-xs mt-1 font-bold">Nama pengirim tidak terdaftar di sistem</p>
                )}
              </div>
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

              {/* Row 3 */}
              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">No Telepon</label>
                <input 
                  type="text" 
                  name="no_telepon"
                  placeholder="Contoh: 081234567890"
                  value={formData.no_telepon}
                  maxLength={12}
                  onChange={handleInputChange}
                  className={`w-full px-5 py-4 bg-white border-2 rounded-2xl font-medium transition-all focus:ring-4 focus:ring-emerald-50 focus:outline-none ${errors.no_telepon || errors.no_telepon_length ? 'border-red-300' : 'border-[#e0e7e3] focus:border-[#24a173]'}`}
                />
                {errors.no_telepon && (
                  <p className="text-red-500 text-xs mt-1 font-bold">Nomor telepon wajib diisi</p>
                )}
                {errors.no_telepon_length && (
                  <p className="text-red-500 text-xs mt-1 font-bold">Nomor telepon harus terdiri dari 10 sampai 12 digit</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Jenis Barang</label>
                <input 
                  type="text" 
                  name="jenis_barang"
                  placeholder="Contoh: Elektronik, Pakaian"
                  value={formData.jenis_barang}
                  onChange={handleInputChange}
                  className={`w-full px-5 py-4 bg-white border-2 rounded-2xl font-medium transition-all focus:ring-4 focus:ring-emerald-50 focus:outline-none ${errors.jenis_barang ? 'border-red-300' : 'border-[#e0e7e3] focus:border-[#24a173]'}`}
                />
              </div>

              {/* Row 4 */}
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

              {/* Row 4b: Kode Pos */}
              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Kode Pos Kirim</label>
                <input 
                  type="text" 
                  name="kode_pos"
                  placeholder="Contoh: 12345"
                  value={formData.kode_pos}
                  onChange={handleInputChange}
                  className={`w-full px-5 py-4 bg-white border-2 rounded-2xl font-medium transition-all focus:ring-4 focus:ring-emerald-50 focus:outline-none ${errors.kode_pos ? 'border-red-300' : 'border-[#e0e7e3] focus:border-[#24a173]'}`}
                />
                {errors.kode_pos && (
                  <p className="text-red-500 text-xs mt-1 font-bold">Kode pos wajib diisi</p>
                )}
              </div>

              {/* Alamat Penerima */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Alamat Penerima</label>
                <input 
                  type="text" 
                  name="alamat"
                  placeholder="Contoh: Jl. Diponegoro No. 23, RT 02/RW 03"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  className={`w-full px-5 py-4 bg-white border-2 rounded-2xl font-medium transition-all focus:ring-4 focus:ring-emerald-50 focus:outline-none ${errors.alamat ? 'border-red-300' : 'border-[#e0e7e3] focus:border-[#24a173]'}`}
                />
                {errors.alamat && (
                  <p className="text-red-500 text-xs mt-1 font-bold">Alamat wajib diisi</p>
                )}
              </div>

              {/* Row 5 */}
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
              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Jenis Pengiriman</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-[#f8faf9] border-2 border-transparent rounded-2xl font-medium text-[#0c5132] focus:ring-4 focus:ring-emerald-50 outline-none cursor-pointer"
                >
                  <option value="Reguler">Reguler (Rp 15.000/kg)</option>
                  <option value="Express">Express (Rp 25.000/kg)</option>
                  <option value="Cargo">Cargo (Rp 50.000/kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Harga Total (Bisa di-edit)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                  <input 
                    type="number" 
                    name="total_price"
                    value={formData.total_price || ''}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-5 py-4 bg-white border-2 rounded-2xl font-medium transition-all focus:ring-4 focus:ring-emerald-50 focus:outline-none border-[#e0e7e3] focus:border-[#24a173]"
                  />
                </div>
              </div>

              {/* Row 6 */}
              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Pilih Kendaraan</label>
                <select 
                  name="kendaraan_select"
                  value={formData.plat_kendaraan || ''}
                  onChange={handleInputChange}
                  className={`w-full px-5 py-4 bg-white border-2 rounded-2xl font-medium transition-all focus:ring-4 focus:ring-emerald-50 focus:outline-none cursor-pointer ${errors.jenis_kendaraan ? 'border-red-300' : 'border-[#e0e7e3] focus:border-[#24a173]'}`}
                >
                  <option value="" disabled>Pilih Kendaraan</option>
                  {vehicles.filter(v => v.status_kendaraan === 'Tersedia').map(v => (
                    <option key={v.id} value={v.kode_kendaraan}>
                      {v.nama_kendaraan} - {v.kode_kendaraan} ({v.jenis_kendaraan})
                    </option>
                  ))}
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

              {/* Row 7 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Deskripsi/Catatan Barang (Opsional)</label>
                <textarea 
                  name="deskripsi"
                  placeholder="Contoh: Barang mudah pecah, harap berhati-hati (Boleh dikosongkan)"
                  value={formData.deskripsi}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFormData(prev => ({ ...prev, [name]: value }));
                  }}
                  rows={3}
                  className="w-full px-5 py-4 bg-white border-2 rounded-2xl font-medium transition-all focus:ring-4 focus:ring-emerald-50 focus:outline-none resize-none border-[#e0e7e3] focus:border-[#24a173]"
                ></textarea>
              </div>
            </div>
            {/* Pricing Breakdown Box */}
            {parseInt(formData.total_price || '0') > 0 && (
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
                      <span className="font-bold">Rp {currentPricePerKg.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm md:text-base">
                      <span>Berat:</span>
                      <span className="font-bold">{formData.weight} Kg</span>
                    </div>
                 </div>
                 <div className="flex justify-between items-center">
                    <p className="text-gray-500 font-medium">Total Harga</p>
                    <p className="font-extrabold text-[#0c5132] text-xl">Rp {parseInt(formData.total_price || '0').toLocaleString('id-ID')}</p>
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
                 <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-widest">ID Transaksi: {successData.resi}</p>
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
                       {successData.alamat && (
                          <span className="text-xs text-gray-500 mt-1 block leading-normal">{successData.alamat} {successData.kode_pos && `(Kode Pos: ${successData.kode_pos})`}</span>
                       )}
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
                    Unduh Struk
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
                          tanggal_kirim: '',
                          no_telepon: '',
                          jenis_barang: '',
                          jenis_kendaraan: '',
                          plat_kendaraan: '',
                          deskripsi: '',
                          kode_pos: '',
                          alamat: '',
                          total_price: '',
                        });
                        const newResi = `CKL${Date.now().toString().slice(-7)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
                        setResi(newResi);
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

'use client';

import { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import {
  Bars3Icon,
  ChatBubbleBottomCenterTextIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon,
  InboxIcon,
  CalendarDaysIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Sidebar from '@/components/Sidebar';
import { submitComplaint, fetchMyComplaints } from '@/app/lib/actions';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function FeedbackPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Feedback',
    title: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    async function loadComplaints() {
      const data = await fetchMyComplaints();
      setComplaints(data);
    }
    loadComplaints();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!formData.title.trim()) newErrors.title = true;
    if (!formData.message.trim()) newErrors.message = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const data = new FormData();
    data.append('type', formData.type);
    data.append('title', formData.title);
    data.append('message', formData.message);

    const res = await submitComplaint(data);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(
        formData.type === 'Feedback'
          ? 'Feedback Anda berhasil dikirim! Terima kasih atas dukungannya.'
          : 'Keluhan Anda berhasil dikirim! Admin akan segera menindaklanjuti.'
      );
      setFormData({
        type: 'Feedback',
        title: '',
        message: ''
      });
      // Refresh complaints list
      const updatedComplaints = await fetchMyComplaints();
      setComplaints(updatedComplaints);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      alert(res.error || 'Terjadi kesalahan saat mengirim.');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
            <span className="text-[10px] font-bold text-emerald-600">Feedback & Keluhan</span>
          </div>
        </div>
      </nav>

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-24 right-6 z-[100] bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 max-w-sm md:max-w-md animate-in slide-in-from-top duration-300">
          <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
          <span className="font-bold text-sm leading-normal">{successMsg}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 mt-8 md:mt-12">
        <div className="mb-8 md:mb-12">
          <Link href="/dashboard" className="inline-flex items-center text-[#24a173] font-bold text-sm mb-4 hover:underline group">
            <ArrowLeftIcon className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0c5132] flex items-center gap-3">
            Feedback & Keluhan 💬
          </h1>
          <p className="text-gray-500 font-medium mt-1">Bantu kami meningkatkan kualitas layanan KirimAja</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Form Section (L: 5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-emerald-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#e6fce5] rounded-full -mr-12 -mt-12 opacity-50"></div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="bg-[#e6fce5] p-2 rounded-xl">
                  <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-[#24a173]" />
                </div>
                <h2 className="font-extrabold text-[#0c5132]">Kirim Masukan</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-[#0c5132] mb-2 uppercase tracking-wider">Tipe Pesan</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#f8faf9] border-2 border-transparent rounded-xl font-bold text-[#0c5132] focus:ring-4 focus:ring-emerald-50 outline-none cursor-pointer"
                  >
                    <option value="Feedback">Feedback / Saran (Hijau)</option>
                    <option value="Keluhan">Keluhan Layanan (Oranye)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0c5132] mb-2 uppercase tracking-wider">Subjek / Judul</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Contoh: Kerusakan Paket / Saran Menu"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl font-medium transition-all focus:ring-4 focus:ring-emerald-50 focus:outline-none ${
                      errors.title ? 'border-red-300' : 'border-[#e0e7e3] focus:border-[#24a173]'
                    }`}
                  />
                  {errors.title && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">Subjek harus diisi</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0c5132] mb-2 uppercase tracking-wider">Pesan Detail</label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Tuliskan keluhan atau feedback Anda secara lengkap..."
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl font-medium transition-all focus:ring-4 focus:ring-emerald-50 focus:outline-none resize-none ${
                      errors.message ? 'border-red-300' : 'border-[#e0e7e3] focus:border-[#24a173]'
                    }`}
                  />
                  {errors.message && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">Pesan detail harus diisi</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#24a173] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all hover:bg-[#1b8555] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.98] mt-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
                      Kirim Sekarang
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Support Tip Box */}
            <div className="mt-6 bg-[#e6fce5]/60 rounded-2xl p-5 border border-emerald-100 flex items-start gap-3">
              <ExclamationCircleIcon className="w-5 h-5 text-[#24a173] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#0c5132]/80 font-medium leading-relaxed">
                <span className="font-extrabold text-[#0c5132]">Info:</span> Setiap keluhan (keluhan) akan diproses oleh tim admin kami secara berkala. Anda dapat memantau status tanggapan admin pada daftar riwayat keluhan di samping.
              </div>
            </div>
          </div>

          {/* Complaints History Section (R: 7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-emerald-50 min-h-[300px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-[#0c5132] md:text-lg flex items-center gap-2">
                  Riwayat Kiriman Anda <span className="bg-emerald-50 text-[#24a173] px-2 py-0.5 rounded-full text-xs font-black">{complaints.length}</span>
                </h3>
              </div>

              {complaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-[#f4fcf7] p-5 rounded-full mb-4 border-2 border-emerald-50">
                    <InboxIcon className="w-10 h-10 text-[#24a173]/60" />
                  </div>
                  <h4 className="font-bold text-gray-700 text-sm md:text-base">Belum ada kiriman</h4>
                  <p className="text-gray-400 text-xs mt-1 max-w-xs font-medium">Feedback atau keluhan yang Anda kirimkan akan terdaftar di sini.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                  {complaints.map((c) => (
                    <div 
                      key={c.id} 
                      className="bg-[#f8faf9] hover:bg-white rounded-2xl p-5 border border-gray-100 transition-all hover:shadow-md group flex flex-col gap-3 relative"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          {c.type === 'Feedback' ? (
                            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                              Feedback
                            </span>
                          ) : (
                            <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                              Keluhan
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                            <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-300" />
                            {formatDate(c.created_at)}
                          </div>
                        </div>

                        {/* Status Badge */}
                        {c.status === 'Pending' && (
                          <span className="bg-gray-100 text-gray-500 border border-gray-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                            Menunggu Tanggapan
                          </span>
                        )}
                        {c.status === 'Diproses' && (
                          <span className="bg-[#fff1eb] text-orange-500 border border-orange-100 text-[10px] font-extrabold px-2.5 py-1 rounded-full animate-pulse">
                            Sedang Diproses
                          </span>
                        )}
                        {c.status === 'Selesai' && (
                          <span className="bg-[#e6fce5] text-emerald-600 border border-emerald-100 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                            Selesai
                          </span>
                        )}
                      </div>

                      <div className="mt-1">
                        <h4 className="font-extrabold text-[#0c5132] text-sm group-hover:text-[#24a173] transition-colors">{c.title}</h4>
                        <p className="text-gray-500 text-xs md:text-sm mt-1.5 font-medium leading-relaxed whitespace-pre-wrap">{c.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

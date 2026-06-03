'use client';

import { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  Bars3Icon,
  ExclamationCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  ClockIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  InboxIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import AdminSidebar from '@/app/ui/dashboard/admin-sidebar';
import { fetchAllComplaints, updateComplaintStatus, replyToComplaint } from '@/app/lib/actions';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function AdminComplaintsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [replyingComplaint, setReplyingComplaint] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Stats calculation
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0
  });

  const loadComplaints = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchAllComplaints(searchQuery, typeFilter, statusFilter);
      setComplaints(data);
      
      // Calculate stats based on all complaints in system (or the fetched list for simplicity)
      // Since it's better to show stats of current list or overall, let's calculate based on overall list without filters.
      const allData = await fetchAllComplaints('', 'Semua', 'Semua');
      setStats({
        total: allData.length,
        pending: allData.filter(c => c.status === 'Pending').length,
        processing: allData.filter(c => c.status === 'Diproses').length,
        completed: allData.filter(c => c.status === 'Selesai').length
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [searchQuery, typeFilter, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoadingIds(prev => ({ ...prev, [id]: true }));
    const res = await updateComplaintStatus(id, newStatus);
    setLoadingIds(prev => ({ ...prev, [id]: false }));

    if (res.success) {
      // Reload complaints
      loadComplaints();
    } else {
      alert(res.error || 'Gagal mengubah status.');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`min-h-screen bg-[#f4fcf7] pb-20 ${poppins.className}`}>
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
          <div className="bg-[#fff1eb] p-2.5 rounded-xl border border-orange-100 shadow-sm flex items-center justify-center">
            <ExclamationCircleIcon className="w-6 h-6 text-[#ff6b35] stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-extrabold text-[#0c5132] tracking-tight block leading-none mb-0.5 shadow-sm">KirimAja</span>
            <span className="text-[11px] md:text-xs text-[#24a173] font-bold uppercase tracking-wider block">Admin / Keluhan</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-6 md:px-10 mt-6 md:mt-8 max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link 
              href="/dashboard-admin" 
              className="inline-flex items-center text-[#24a173] font-bold text-sm mb-4 hover:underline gap-1.5 group"
            >
              <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Kembali ke Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-[#0c5132] flex items-center gap-2.5">
              Keluhan & Feedback Pelanggan 📣
            </h1>
            <p className="text-gray-500 font-medium">Tanggapi keluhan dan saran demi kepuasan pelanggan KirimAja</p>
          </div>

          <button
            onClick={loadComplaints}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 bg-[#24a173]/10 hover:bg-[#24a173]/20 text-[#0c5132] px-5 py-3 rounded-2xl font-bold transition-all disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Segarkan Data
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Total Complaints */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50 flex items-center gap-5 transition-all duration-300 hover:shadow-md">
            <div className="bg-[#e6fce5] text-[#24a173] p-4 rounded-2xl">
              <ExclamationCircleIcon className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total Keluhan</p>
              <h3 className="text-2xl md:text-3xl font-black text-[#0c5132]">{stats.total}</h3>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50 flex items-center gap-5 transition-all duration-300 hover:shadow-md">
            <div className="bg-slate-100 text-slate-500 p-4 rounded-2xl">
              <ClockIcon className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Menunggu</p>
              <h3 className="text-2xl md:text-3xl font-black text-[#0c5132]">{stats.pending}</h3>
            </div>
          </div>

          {/* Diproses */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50 flex items-center gap-5 transition-all duration-300 hover:shadow-md">
            <div className="bg-[#fff1eb] text-orange-500 p-4 rounded-2xl">
              <ArrowPathIcon className="w-6 h-6 animate-spin" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Diproses</p>
              <h3 className="text-2xl md:text-3xl font-black text-[#0c5132]">{stats.processing}</h3>
            </div>
          </div>

          {/* Selesai */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50 flex items-center gap-5 transition-all duration-300 hover:shadow-md">
            <div className="bg-[#e6fce5] text-emerald-600 p-4 rounded-2xl">
              <CheckCircleIcon className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Selesai</p>
              <h3 className="text-2xl md:text-3xl font-black text-[#0c5132]">{stats.completed}</h3>
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-50 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1 max-w-md">
            <input 
              type="text"
              placeholder="Cari pengirim, email, subjek, pesan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-5 py-3.5 bg-[#f4fcf7] border-2 border-transparent focus:border-[#24a173] rounded-2xl font-medium outline-none transition-all placeholder-gray-400 text-[#0c5132]"
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0c5132] uppercase tracking-wider">Tipe:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2.5 bg-[#f4fcf7] border-2 border-transparent rounded-xl font-bold text-xs text-[#0c5132] outline-none cursor-pointer"
              >
                <option value="Semua">Semua</option>
                <option value="Feedback">Feedback</option>
                <option value="Keluhan">Keluhan</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0c5132] uppercase tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-[#f4fcf7] border-2 border-transparent rounded-xl font-bold text-xs text-[#0c5132] outline-none cursor-pointer"
              >
                <option value="Semua">Semua</option>
                <option value="Pending">Menunggu</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>
        </div>

        {/* Complaints Table/List Card */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-50 overflow-hidden">
          {complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="bg-[#f4fcf7] p-6 rounded-full mb-4 border border-emerald-50">
                <InboxIcon className="w-12 h-12 text-[#24a173]/50" />
              </div>
              <h3 className="font-extrabold text-gray-700 text-lg">Tidak ada keluhan ditemukan</h3>
              <p className="text-gray-400 text-sm mt-1 max-w-sm font-medium">
                Coba sesuaikan pencarian atau filter Anda untuk menampilkan data keluhan pelanggan.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#f8faf9] text-xs font-bold text-[#0c5132] uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-5">Pengirim</th>
                    <th className="px-6 py-5">Jenis & Tanggal</th>
                    <th className="px-6 py-5">Isi Masukan</th>
                    <th className="px-6 py-5">Aksi Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                      {/* Column 1: Sender details */}
                      <td className="px-6 py-5 align-top">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-inner flex-shrink-0 text-sm overflow-hidden bg-[#1b8555]">
                            {c.avatar_url ? (
                              <img 
                                src={c.avatar_url} 
                                alt={c.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{c.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-[#0c5132] text-sm leading-tight">{c.name}</h4>
                            <p className="text-xs text-gray-400 font-semibold mt-0.5">{c.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Type and Date */}
                      <td className="px-6 py-5 align-top">
                        <div className="flex flex-col gap-2">
                          <div>
                            {c.type === 'Feedback' ? (
                              <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider inline-block">
                                Feedback
                              </span>
                            ) : (
                              <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider inline-block">
                                Keluhan
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-gray-400 whitespace-nowrap">
                            {formatDate(c.created_at)}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Subject & Message */}
                      <td className="px-6 py-5 align-top max-w-md">
                        <div className="flex flex-col gap-1">
                          <h5 className="font-extrabold text-sm text-[#0c5132] group-hover:text-[#24a173] transition-colors">{c.title}</h5>
                          <p className="text-gray-500 text-xs md:text-sm font-medium leading-relaxed whitespace-pre-wrap mt-0.5">{c.message}</p>
                          
                          {c.admin_reply && (
                            <div className="mt-2.5 p-3 bg-emerald-50/70 border border-emerald-100/50 rounded-2xl text-xs">
                              <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold mb-1">
                                <ChatBubbleBottomCenterTextIcon className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2} />
                                <span>Balasan Anda:</span>
                              </div>
                              <p className="text-emerald-700 font-medium whitespace-pre-wrap leading-relaxed">{c.admin_reply}</p>
                              {c.replied_at && (
                                <span className="text-[9px] text-emerald-600/70 font-semibold block mt-1">Dibalas pada {formatDate(c.replied_at)}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Status Selector */}
                      <td className="px-6 py-5 align-top whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <div className="relative">
                            {loadingIds[c.id] ? (
                              <div className="w-5 h-5 border-3 border-[#24a173]/30 border-t-[#24a173] rounded-full animate-spin"></div>
                            ) : (
                              <select
                                value={c.status}
                                onChange={(e) => handleStatusChange(c.id, e.target.value)}
                                className={`px-3 py-2 rounded-xl text-xs font-black outline-none border transition-all cursor-pointer w-full ${
                                  c.status === 'Pending' 
                                    ? 'bg-slate-100 text-slate-600 border-slate-200 focus:ring-slate-100'
                                    : c.status === 'Diproses'
                                    ? 'bg-[#fff1eb] text-orange-600 border-orange-200 focus:ring-orange-100'
                                    : 'bg-[#e6fce5] text-emerald-600 border-emerald-200 focus:ring-emerald-100'
                                }`}
                              >
                                <option value="Pending">⌛ Menunggu</option>
                                <option value="Diproses">⚙️ Diproses</option>
                                <option value="Selesai">✅ Selesai</option>
                              </select>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setReplyingComplaint(c);
                              setReplyText(c.admin_reply || '');
                            }}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#24a173] hover:bg-[#1b8555] text-white rounded-xl text-xs font-bold transition-all active:scale-[0.97] shadow-sm w-full"
                          >
                            <ChatBubbleBottomCenterTextIcon className="w-3.5 h-3.5" />
                            <span>{c.admin_reply ? 'Edit Balasan' : 'Balas'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {replyingComplaint && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 py-10 bg-[#0c5132]/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col p-8 animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button 
              onClick={() => setReplyingComplaint(null)}
              className="absolute top-5 right-5 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-2xl font-extrabold text-[#0c5132] mb-5 flex items-center gap-2">
              <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-[#24a173]" />
              Kirim Tanggapan Resmi 📣
            </h3>

            {/* Complaint Summary */}
            <div className="bg-[#f8faf9] rounded-2xl p-5 border border-gray-100 mb-6 max-h-56 overflow-y-auto">
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100/50">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs overflow-hidden bg-[#1b8555] flex-shrink-0">
                  {replyingComplaint.avatar_url ? (
                    <img 
                      src={replyingComplaint.avatar_url} 
                      alt={replyingComplaint.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{replyingComplaint.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-[#24a173] uppercase bg-[#e6fce5] px-2 py-0.5 rounded">
                      {replyingComplaint.type}
                    </span>
                    <span className="font-extrabold text-sm text-[#0c5132]">{replyingComplaint.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 mt-0.5">{replyingComplaint.email}</span>
                </div>
              </div>
              <h4 className="font-extrabold text-sm text-[#0c5132] mb-1">{replyingComplaint.title}</h4>
              <p className="text-gray-500 text-xs md:text-sm font-medium leading-relaxed whitespace-pre-wrap">{replyingComplaint.message}</p>
            </div>

            {/* Reply Input Form */}
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!replyText.trim()) return;

                setIsSubmittingReply(true);
                const res = await replyToComplaint(replyingComplaint.id, replyText);
                setIsSubmittingReply(false);

                if (res.success) {
                  setReplyingComplaint(null);
                  setReplyText('');
                  loadComplaints();
                } else {
                  alert(res.error || 'Gagal mengirim balasan.');
                }
              }}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block text-xs font-bold text-[#0c5132] mb-2 uppercase tracking-wider">
                  Tulis Tanggapan / Solusi <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Ketik tanggapan resmi, penjelasan, atau solusi untuk pelanggan di sini..."
                  className="w-full px-4 py-3.5 bg-[#f8faf9] border-2 border-transparent focus:border-[#24a173] rounded-2xl font-medium outline-none transition-all placeholder-gray-400 text-sm text-[#0c5132] resize-none"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button 
                  type="button"
                  onClick={() => setReplyingComplaint(null)}
                  className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all text-sm"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingReply || !replyText.trim()}
                  className="flex-1 py-3.5 bg-[#24a173] hover:bg-[#1b8555] text-white rounded-2xl font-bold transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md"
                >
                  {isSubmittingReply ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span>Kirim Tanggapan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

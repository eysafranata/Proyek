"use client";

import { useState, useEffect, useCallback } from "react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import {
  Bars3Icon,
  TruckIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  CubeIcon,
  ArrowPathIcon,
  InboxIcon,
  FunnelIcon,
  PencilIcon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import AdminSidebar from "@/app/ui/dashboard/admin-sidebar";
import { fetchAllPackages, updatePackageStatus, updatePackageDetails, deletePackage, fetchVehicles } from "@/app/lib/actions";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function StatusBadge({ status }: { status: string }) {
  if (status === "Selesai")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border bg-emerald-100 text-emerald-700 border-emerald-200">
        <CheckCircleIcon className="w-3.5 h-3.5" /> Selesai
      </span>
    );
  if (status === "Dalam Perjalanan")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border bg-amber-100 text-amber-700 border-amber-200">
        <TruckIcon className="w-3.5 h-3.5" /> Dalam Perjalanan
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border bg-blue-100 text-blue-700 border-blue-200">
      <ClockIcon className="w-3.5 h-3.5" /> {status}
    </span>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,"0")}.${String(d.getMinutes()).padStart(2,"0")}`;
}

function formatRupiah(val: number): string {
  return "Rp " + val.toLocaleString("id-ID");
}

export default function KelolaPaketPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<any | null>(null);

  const [editingPackage, setEditingPackage] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    status: "",
    status_barang: "",
    status_transaksi: "",
    plat_kendaraan: "",
    total_price: 0,
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);

  const total = packages.length;
  const selesai = packages.filter((p) => p.status === "Selesai").length;
  const proses = packages.filter((p) => p.status !== "Selesai").length;

  const loadPackages = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchAllPackages(searchQuery, statusFilter);
      setPackages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  useEffect(() => {
    async function loadVehicles() {
      const v = await fetchVehicles();
      setVehicles(v);
    }
    loadVehicles();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoadingIds((prev) => ({ ...prev, [id]: true }));
    const res = await updatePackageStatus(id, newStatus);
    setLoadingIds((prev) => ({ ...prev, [id]: false }));

    if (res.success) {
      setSuccessId(id);
      setTimeout(() => setSuccessId(null), 2000);
      loadPackages();
    } else {
      alert(res.error ?? "Gagal mengubah status.");
    }
  };

  const openEditModal = (pkg: any) => {
    setEditingPackage(pkg);
    setEditFormData({
      status: pkg.status,
      status_barang: pkg.status_barang || "Aman",
      status_transaksi: pkg.status_transaksi || "Belum Lunas",
      plat_kendaraan: pkg.plat_kendaraan || "",
      total_price: pkg.total_price || 0,
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    setIsSavingEdit(true);
    const data = new FormData();
    data.append("status", editFormData.status);
    data.append("status_barang", editFormData.status_barang);
    data.append("status_transaksi", editFormData.status_transaksi);
    data.append("plat_kendaraan", editFormData.plat_kendaraan);
    data.append("total_price", editFormData.total_price.toString());

    const result = await updatePackageDetails(editingPackage.id, data);
    setIsSavingEdit(false);
    if (result.success) {
      setEditingPackage(null);
      setSuccessId(editingPackage.id);
      setTimeout(() => setSuccessId(null), 2000);
      loadPackages();
    } else {
      alert(result.error || "Gagal menyimpan perubahan.");
    }
  };

  const confirmDeletePackage = async (id: string) => {
    setLoadingIds((prev) => ({ ...prev, [id]: true }));
    const result = await deletePackage(id);
    setLoadingIds((prev) => ({ ...prev, [id]: false }));

    if (result.success) {
      loadPackages();
    } else {
      alert(result.error || "Gagal menghapus paket.");
    }
  };

  return (
    <div className={`min-h-screen bg-[#f4fcf7] pb-20 ${poppins.className}`}>
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Navbar */}
      <nav className="flex items-center px-6 md:px-10 py-4 w-full bg-[#f4fcf7] sticky top-0 z-50">
        <button onClick={() => setIsSidebarOpen(true)} className="mr-5 text-[#24a173] hover:bg-[#e6fce5] p-2 rounded-lg transition-colors">
          <Bars3Icon className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-[#e6fce5] p-2.5 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-center">
            <TruckIcon className="w-6 h-6 text-[#1b8555] stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-extrabold text-[#0c5132] tracking-tight block leading-none mb-0.5">KirimAja</span>
            <span className="text-[11px] md:text-xs text-[#24a173] font-bold uppercase tracking-wider block">Admin / Kelola Paket</span>
          </div>
        </div>
      </nav>

      <div className="px-6 md:px-10 mt-4 max-w-screen-xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard-admin" className="inline-flex items-center text-[#24a173] font-bold text-sm mb-3 hover:underline gap-1.5 group">
              <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Kembali ke Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-[#0c5132]">Kelola Paket 📦</h1>
            <p className="text-gray-500 font-medium mt-1">Update status pengiriman paket pelanggan secara real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadPackages} disabled={isRefreshing} className="inline-flex items-center gap-2 bg-[#24a173]/10 hover:bg-[#24a173]/20 text-[#0c5132] px-4 py-2.5 rounded-2xl font-bold text-sm transition-all disabled:opacity-50">
              <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Segarkan
            </button>
            <Link href="/dashboard-admin/add-package" className="inline-flex items-center gap-2 bg-[#24a173] text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-[#1b8555] transition-all shadow-sm">
              <CubeIcon className="w-4 h-4" /> Tambah Paket
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-[#e6fce5] p-2.5 rounded-xl"><CubeIcon className="w-5 h-5 text-[#24a173]" strokeWidth={2} /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Paket</p>
              <h3 className="text-2xl font-black text-[#0c5132]">{total}</h3>
            </div>
          </div>
          <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-amber-50 p-2.5 rounded-xl"><TruckIcon className="w-5 h-5 text-amber-500" strokeWidth={2} /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dalam Proses</p>
              <h3 className="text-2xl font-black text-amber-600">{proses}</h3>
            </div>
          </div>
          <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-emerald-50 p-2.5 rounded-xl"><CheckCircleIcon className="w-5 h-5 text-emerald-500" strokeWidth={2} /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Selesai</p>
              <h3 className="text-2xl font-black text-emerald-600">{selesai}</h3>
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari resi, pengirim, penerima, no telp, asal/tujuan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#f4fcf7] border-2 border-transparent focus:border-[#24a173] rounded-2xl font-medium outline-none transition-all placeholder-gray-400 text-sm text-[#0c5132]"
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <FunnelIcon className="w-4 h-4 text-[#24a173]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-[#f4fcf7] border-2 border-transparent rounded-2xl font-bold text-sm text-[#0c5132] outline-none cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Dalam Pengiriman">Dalam Pengiriman</option>
              <option value="Dalam Perjalanan">Dalam Perjalanan</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>

        {/* Package Table */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-50 overflow-hidden">
          {packages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="bg-[#f4fcf7] p-6 rounded-full mb-4 border border-emerald-50">
                <InboxIcon className="w-12 h-12 text-[#24a173]/50" />
              </div>
              <h3 className="font-extrabold text-gray-700 text-lg">Tidak ada paket ditemukan</h3>
              <p className="text-gray-400 text-sm mt-1 font-medium">
                {searchQuery || statusFilter !== "Semua" ? "Coba sesuaikan pencarian atau filter." : "Belum ada paket yang ditambahkan."}
              </p>
              <Link href="/dashboard-admin/add-package" className="mt-5 inline-flex items-center gap-2 bg-[#24a173] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#1b8555] transition-all shadow-sm">
                <CubeIcon className="w-4 h-4" /> Tambah Paket Baru
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#f8faf9] text-[11px] font-bold text-[#0c5132] uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-4">Resi & Tanggal</th>
                    <th className="px-6 py-4">Pengirim</th>
                    <th className="px-6 py-4">Penerima</th>
                    <th className="px-6 py-4">Rute</th>
                    <th className="px-6 py-4">Info Paket</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {packages.map((pkg) => (
                    <tr
                      key={pkg.id}
                      className={`transition-all duration-500 group ${
                        successId === pkg.id
                          ? "bg-emerald-50"
                          : "hover:bg-gray-50/60"
                      }`}
                    >
                      {/* Resi */}
                      <td className="px-6 py-5 align-top min-w-[150px]">
                        <span className="font-black text-[#0c5132] text-sm block tracking-tight">{pkg.resi}</span>
                        <span className="text-[10px] text-gray-400 font-semibold mt-0.5 block">{formatDate(pkg.created_at)}</span>
                      </td>

                      {/* Pengirim */}
                      <td className="px-6 py-5 align-top">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#1b8555] text-white font-black flex items-center justify-center text-sm flex-shrink-0">
                            {pkg.sender_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-sm text-[#0c5132]">{pkg.sender_name}</span>
                        </div>
                      </td>

                      {/* Penerima */}
                      <td className="px-6 py-5 align-top">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-400 text-white font-black flex items-center justify-center text-sm flex-shrink-0">
                            {pkg.receiver_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-sm text-gray-600">{pkg.receiver_name}</span>
                        </div>
                      </td>

                      {/* Rute */}
                      <td className="px-6 py-5 align-top min-w-[160px]">
                        <div className="flex items-center gap-1.5 text-sm font-semibold">
                          <span className="text-[#24a173] font-bold">{pkg.origin}</span>
                          <span className="text-gray-300 font-normal">→</span>
                          <span className="text-gray-600">{pkg.destination}</span>
                        </div>
                      </td>

                      {/* Info */}
                      <td className="px-6 py-5 align-top">
                        <div className="flex flex-col gap-0.5 text-xs font-semibold">
                          <span className="text-gray-500">{pkg.weight} Kg · {pkg.type}</span>
                          <span className="font-extrabold text-[#0c5132]">{formatRupiah(Number(pkg.total_price))}</span>
                          <span className="text-gray-400">{pkg.payment_method}</span>
                          <div className="flex flex-col gap-0.5 mt-1 pt-1 border-t border-gray-100">
                            <span className="text-[10px] text-gray-500">Barang: <span className="font-bold text-[#0c5132]">{pkg.status_barang || 'Aman'}</span></span>
                            <span className="text-[10px] text-gray-500">Transaksi: <span className="font-bold text-[#0c5132]">{pkg.status_transaksi || 'Belum Lunas'}</span></span>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-5 align-top">
                        <StatusBadge status={pkg.status} />
                      </td>

                      {/* Update Actions */}
                      <td className="px-6 py-5 align-top min-w-[180px]">
                        {loadingIds[pkg.id] ? (
                          <div className="w-5 h-5 border-2 border-[#24a173]/30 border-t-[#24a173] rounded-full animate-spin" />
                        ) : pkg.status === "Selesai" ? (
                          <span className="text-emerald-600 font-bold text-xs flex items-center gap-1.5">
                            <CheckCircleIcon className="w-4 h-4" /> Sudah Selesai
                          </span>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => openEditModal(pkg)}
                              className="px-3 py-2 rounded-xl text-[11px] font-extrabold bg-[#e6fce5] text-[#1b8555] hover:bg-[#d1f5d0] active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm w-full border border-emerald-100"
                            >
                              <PencilIcon className="w-3.5 h-3.5" />
                              Edit Data
                            </button>
                            {pkg.status !== "Selesai" && (
                              <button
                                onClick={() => handleStatusChange(pkg.id, "Selesai")}
                                className="px-3 py-2 rounded-xl text-[11px] font-extrabold bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm w-full"
                              >
                                <CheckCircleIcon className="w-3.5 h-3.5" />
                                Selesai Cepat
                              </button>
                            )}
                            <button
                              onClick={() => setDeletingPackage(pkg)}
                              className="px-3 py-2 rounded-xl text-[11px] font-extrabold bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm w-full border border-red-100 mt-1"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                              Hapus
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {packages.length > 0 && (
          <p className="text-center text-xs text-gray-400 font-medium mt-4 pb-4">
            Menampilkan {packages.length} paket
          </p>
        )}
      </div>

      {/* Edit Modal */}
      {editingPackage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-10 bg-[#0c5132]/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col p-8">
            <button 
              onClick={() => setEditingPackage(null)}
              className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-extrabold text-[#0c5132] mb-6">Edit Paket 📦</h3>
            
            <form onSubmit={handleSaveEdit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Status Pengiriman</label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-3 bg-[#f8faf9] border-2 border-transparent rounded-2xl font-medium text-[#0c5132] focus:border-[#24a173] outline-none"
                >
                  <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Dalam Pengiriman">Dalam Pengiriman</option>
                  <option value="Dalam Perjalanan">Dalam Perjalanan</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Status Barang</label>
                <select
                  name="status_barang"
                  value={editFormData.status_barang}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-3 bg-[#f8faf9] border-2 border-transparent rounded-2xl font-medium text-[#0c5132] focus:border-[#24a173] outline-none"
                >
                  <option value="Aman">Aman</option>
                  <option value="Rusak">Rusak</option>
                  <option value="Hilang">Hilang</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Kendaraan & Plat</label>
                <select
                  name="plat_kendaraan"
                  value={editFormData.plat_kendaraan}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-3 bg-[#f8faf9] border-2 border-transparent rounded-2xl font-medium text-[#0c5132] focus:border-[#24a173] outline-none"
                >
                  <option value="">Tidak Ditentukan</option>
                  {vehicles.filter(v => v.status_kendaraan === 'Tersedia').map(v => (
                    <option key={v.id} value={v.kode_kendaraan}>
                      {v.nama_kendaraan} - {v.kode_kendaraan}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Status Transaksi</label>
                <select
                  name="status_transaksi"
                  value={editFormData.status_transaksi}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-3 bg-[#f8faf9] border-2 border-transparent rounded-2xl font-medium text-[#0c5132] focus:border-[#24a173] outline-none"
                >
                  <option value="Belum Lunas">Belum Lunas</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Harga Pengiriman (Tidak dapat diubah)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                  <input
                    type="number"
                    name="total_price"
                    value={editFormData.total_price}
                    disabled
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-400 cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => setEditingPackage(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 py-3 bg-[#24a173] text-white rounded-2xl font-bold hover:bg-[#1b8555] transition-all disabled:opacity-50"
                >
                  {isSavingEdit ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deletingPackage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-[#0c5132]/20 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setDeletingPackage(null)}
          ></div>
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl relative z-10 overflow-hidden p-6 md:p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 border border-red-100">
              <TrashIcon className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-extrabold text-[#0c5132] mb-3">Konfirmasi Hapus</h3>
            <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus data paket dengan resi <span className="font-extrabold text-red-500">"{deletingPackage.resi}"</span> (Pengirim: {deletingPackage.sender_name})? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingPackage(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all text-sm"
              >
                Batal
              </button>
              <button 
                onClick={async () => {
                  const id = deletingPackage.id;
                  setDeletingPackage(null);
                  await confirmDeletePackage(id);
                }}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all text-sm flex items-center justify-center gap-1.5"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

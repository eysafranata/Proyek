"use client";

import { useState, useEffect, useCallback } from "react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import {
  Bars3Icon,
  TruckIcon,
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  InboxIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import AdminSidebar from "@/app/ui/dashboard/admin-sidebar";
import { fetchVehicles, createVehicle, updateVehicle, deleteVehicle } from "@/app/lib/actions";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function KendaraanPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nama_kendaraan: "",
    jenis_kendaraan: "Motor",
    kode_kendaraan: "",
    kapasitas_muatan: "",
    status_kendaraan: "Tersedia",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deletingVehicle, setDeletingVehicle] = useState<any | null>(null);

  const loadVehicles = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchVehicles();
      setVehicles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      nama_kendaraan: "",
      jenis_kendaraan: "Motor",
      kode_kendaraan: "",
      kapasitas_muatan: "",
      status_kendaraan: "Tersedia",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: any) => {
    setIsEditMode(true);
    setEditingId(vehicle.id);
    setFormData({
      nama_kendaraan: vehicle.nama_kendaraan,
      jenis_kendaraan: vehicle.jenis_kendaraan,
      kode_kendaraan: vehicle.kode_kendaraan,
      kapasitas_muatan: vehicle.kapasitas_muatan.toString(),
      status_kendaraan: vehicle.status_kendaraan,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validations
    const newErrors: Record<string, string> = {};
    if (!formData.nama_kendaraan.trim()) {
      newErrors.nama_kendaraan = "Nama kendaraan wajib diisi.";
    }
    if (!formData.kode_kendaraan.trim()) {
      newErrors.kode_kendaraan = "Plat nomor/kode kendaraan wajib diisi.";
    } else {
      const platRegex = /^[bB]\s?\d{4}\s?[a-zA-Z]+$/;
      if (!platRegex.test(formData.kode_kendaraan.trim())) {
        newErrors.kode_kendaraan = "Format plat nomor salah. Harus diawali dengan B, diikuti 4 digit angka, lalu kombinasi huruf (Contoh: B 1234 ABC).";
      }
    }
    if (!formData.kapasitas_muatan.trim()) {
      newErrors.kapasitas_muatan = "Kapasitas muatan wajib diisi.";
    } else if (isNaN(Number(formData.kapasitas_muatan)) || Number(formData.kapasitas_muatan) <= 0) {
      newErrors.kapasitas_muatan = "Kapasitas muatan harus berupa angka positif.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    let res;
    if (isEditMode && editingId) {
      res = await updateVehicle(editingId, data);
    } else {
      res = await createVehicle(data);
    }

    setIsSubmitting(false);

    if (res.success) {
      setIsModalOpen(false);
      loadVehicles();
    } else {
      alert(res.error || "Gagal menyimpan data.");
    }
  };

  const confirmDelete = async (id: string) => {
    const res = await deleteVehicle(id);
    if (res.success) {
      loadVehicles();
    } else {
      alert(res.error || "Gagal menghapus kendaraan.");
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
            <span className="text-[11px] md:text-xs text-[#24a173] font-bold uppercase tracking-wider block">Admin / Kelola Kendaraan</span>
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
            <h1 className="text-3xl font-extrabold text-[#0c5132]">Kelola Kendaraan 🚚</h1>
            <p className="text-gray-500 font-medium mt-1">Data operasional kendaraan untuk logistik pengiriman</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadVehicles} disabled={isRefreshing} className="inline-flex items-center gap-2 bg-[#24a173]/10 hover:bg-[#24a173]/20 text-[#0c5132] px-4 py-2.5 rounded-2xl font-bold text-sm transition-all disabled:opacity-50">
              <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Segarkan
            </button>
            <button onClick={openAddModal} className="inline-flex items-center gap-2 bg-[#24a173] text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-[#1b8555] transition-all shadow-sm">
              <PlusIcon className="w-4 h-4" /> Tambah Kendaraan
            </button>
          </div>
        </div>

        {/* Vehicles Table */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-50 overflow-hidden">
          {vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="bg-[#f4fcf7] p-6 rounded-full mb-4 border border-emerald-50">
                <InboxIcon className="w-12 h-12 text-[#24a173]/50" />
              </div>
              <h3 className="font-extrabold text-gray-700 text-lg">Tidak ada kendaraan</h3>
              <p className="text-gray-400 text-sm mt-1 font-medium">Belum ada armada kendaraan yang ditambahkan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#f8faf9] text-[11px] font-bold text-[#0c5132] uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-4">Nama Kendaraan</th>
                    <th className="px-6 py-4">Jenis</th>
                    <th className="px-6 py-4">Plat/Kode</th>
                    <th className="px-6 py-4">Kapasitas (Kg)</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-5 font-bold text-[#0c5132]">{v.nama_kendaraan}</td>
                      <td className="px-6 py-5 text-gray-600 font-medium">{v.jenis_kendaraan}</td>
                      <td className="px-6 py-5 text-gray-600 font-medium uppercase tracking-wider">{v.kode_kendaraan}</td>
                      <td className="px-6 py-5 font-bold text-[#24a173]">{v.kapasitas_muatan}</td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                          v.status_kendaraan === 'Tersedia' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          v.status_kendaraan === 'Diproses' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          v.status_kendaraan === 'Dalam Pengiriman' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>
                          {v.status_kendaraan}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal(v)} className="p-2 text-[#24a173] hover:bg-emerald-50 rounded-xl transition-colors">
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button onClick={() => setDeletingVehicle(v)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                            <TrashIcon className="w-5 h-5" />
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

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-10 bg-[#0c5132]/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col p-8">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-extrabold text-[#0c5132] mb-6">
              {isEditMode ? "Edit Kendaraan" : "Tambah Kendaraan"}
            </h3>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-[#0c5132] mb-2">Nama Kendaraan</label>
                <input
                  type="text"
                  name="nama_kendaraan"
                  value={formData.nama_kendaraan}
                  onChange={handleInputChange}
                  placeholder="Contoh: Honda Vario"
                  className={`w-full px-4 py-3 bg-[#f8faf9] border-2 rounded-2xl font-medium text-[#0c5132] focus:border-[#24a173] outline-none transition-all ${
                    errors.nama_kendaraan ? 'border-red-500' : 'border-transparent'
                  }`}
                />
                {errors.nama_kendaraan && (
                  <p className="text-red-500 text-xs mt-1 font-bold">{errors.nama_kendaraan}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#0c5132] mb-2">Jenis Kendaraan</label>
                  <select
                    name="jenis_kendaraan"
                    value={formData.jenis_kendaraan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#f8faf9] border-2 border-transparent rounded-2xl font-medium text-[#0c5132] focus:border-[#24a173] outline-none"
                  >
                    <option value="Motor">Motor</option>
                    <option value="Mobil">Mobil</option>
                    <option value="Cargo">Cargo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0c5132] mb-2">Kode / Plat</label>
                  <input
                    type="text"
                    name="kode_kendaraan"
                    value={formData.kode_kendaraan}
                    onChange={handleInputChange}
                    placeholder="B 1234 CD"
                    className={`w-full px-4 py-3 bg-[#f8faf9] border-2 rounded-2xl font-medium text-[#0c5132] focus:border-[#24a173] outline-none uppercase transition-all ${
                      errors.kode_kendaraan ? 'border-red-500' : 'border-transparent'
                    }`}
                  />
                  {errors.kode_kendaraan && (
                    <p className="text-red-500 text-xs mt-1 font-bold">{errors.kode_kendaraan}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#0c5132] mb-2">Kapasitas (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="kapasitas_muatan"
                    value={formData.kapasitas_muatan}
                    onChange={handleInputChange}
                    placeholder="100"
                    className={`w-full px-4 py-3 bg-[#f8faf9] border-2 rounded-2xl font-medium text-[#0c5132] focus:border-[#24a173] outline-none transition-all ${
                      errors.kapasitas_muatan ? 'border-red-500' : 'border-transparent'
                    }`}
                  />
                  {errors.kapasitas_muatan && (
                    <p className="text-red-500 text-xs mt-1 font-bold">{errors.kapasitas_muatan}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0c5132] mb-2">Status</label>
                  <select
                    name="status_kendaraan"
                    value={formData.status_kendaraan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#f8faf9] border-2 border-transparent rounded-2xl font-medium text-[#0c5132] focus:border-[#24a173] outline-none"
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Dalam Pengiriman">Dalam Pengiriman</option>
                    <option value="Maintenance">Dalam Perbaikan</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#24a173] text-white rounded-2xl font-bold hover:bg-[#1b8555] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deletingVehicle && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-[#0c5132]/20 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setDeletingVehicle(null)}
          ></div>
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl relative z-10 overflow-hidden p-6 md:p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 border border-red-100">
              <TrashIcon className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-extrabold text-[#0c5132] mb-3">Konfirmasi Hapus</h3>
            <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus kendaraan <span className="font-extrabold text-red-500">"{deletingVehicle.nama_kendaraan} ({deletingVehicle.kode_kendaraan})"</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingVehicle(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all text-sm"
              >
                Batal
              </button>
              <button 
                onClick={async () => {
                  const id = deletingVehicle.id;
                  setDeletingVehicle(null);
                  await confirmDelete(id);
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

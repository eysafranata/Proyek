'use client';

import { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import {
  Bars3Icon,
  UserIcon,
  PencilIcon,
  KeyIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  XMarkIcon,
  CheckCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import Sidebar from '@/components/Sidebar';
import { updateProfile, changePassword, getCurrentUser } from '@/app/lib/actions';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function ProfilePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [user, setUser] = useState<any>({
    id: '', 
    name: 'Loading...', 
    email: '', 
    phone: '', 
    role: ''
  });

  useEffect(() => {
    async function loadUser() {
      const data = await getCurrentUser();
      if (data) {
        setUser(data);
        setEditData(data);
      }
    }
    loadUser();
  }, []);

  const [editData, setEditData] = useState({ ...user });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passErrors, setPassErrors] = useState<any>({});
  const [successMsg, setSuccessMsg] = useState('');

  const handleEditToggle = () => {
    if (isEditing) {
      setEditData({ ...user });
    }
    setIsEditing(!isEditing);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', editData.name);
    formData.append('email', editData.email);
    formData.append('phone', editData.phone);
    
    const res = await updateProfile(user.id, formData);
    if (!res?.message.includes('Error')) {
      setUser({ ...editData });
      setIsEditing(false);
      showSuccess('Profil berhasil diperbarui!');
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassErrors({});
    
    const formData = new FormData();
    formData.append('currentPassword', passwordData.currentPassword);
    formData.append('newPassword', passwordData.newPassword);
    formData.append('confirmPassword', passwordData.confirmPassword);
    
    const res = await changePassword(user.id, formData);
    if (res.error) {
      setPassErrors({ [res.error]: res.message });
    } else if (res.success) {
      setIsPasswordModalOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showSuccess('Password berhasil diubah!');
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className={`min-h-screen bg-[#f4fcf7] pb-10 ${poppins.className}`}>
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
            <span className="text-[10px] font-medium text-emerald-600">Halo, {user.name}!</span>
          </div>
        </div>
      </nav>

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-24 right-6 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 animate-bounce">
          <CheckCircleIcon className="w-6 h-6" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-[#0c5132] mb-2 flex items-center justify-center gap-3">
            Profil Pengguna <UserIcon className="w-8 h-8 opacity-50" />
          </h1>
          <p className="text-gray-500 font-medium">Kelola informasi akun Anda</p>
        </div>

        {/* User Card */}
        <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-emerald-50 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#e6fce5] rounded-full -mr-16 -mt-16 opacity-50"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-24 h-24 bg-[#48cc81] rounded-full flex items-center justify-center text-white text-4xl font-extrabold shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div className="text-center md:text-left flex-grow">
              <h2 className="text-3xl font-extrabold text-[#0c5132] mb-1">{user.name}</h2>
              <p className="text-[#24a173] font-bold text-lg mb-6">{user.role}</p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {!isEditing ? (
                  <>
                    <button 
                      onClick={handleEditToggle}
                      className="bg-[#1db372] text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#159a61] transition-all shadow-sm flex-1 sm:flex-none"
                    >
                      <PencilIcon className="w-5 h-5" /> Edit Profil
                    </button>
                    <button 
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="bg-white text-emerald-600 border-2 border-emerald-50 px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all flex-1 sm:flex-none"
                    >
                      <KeyIcon className="w-5 h-5" /> Ganti Password
                    </button>
                  </>
                ) : (
                  <div className="flex gap-4 w-full sm:w-auto">
                    <button 
                      onClick={handleEditToggle}
                      className="bg-white text-red-500 border-2 border-red-50 px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-all flex-1"
                    >
                      <XMarkIcon className="w-5 h-5" /> Batal
                    </button>
                    <button 
                      onClick={handleProfileSave}
                      className="bg-[#1db372] text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#159a61] transition-all shadow-sm flex-1"
                    >
                      <CheckCircleIcon className="w-5 h-5" /> Simpan
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-emerald-50">
          <h3 className="text-lg font-extrabold text-[#0c5132] mb-8">Informasi Akun</h3>
          
          <div className="grid gap-8">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-[#1db372] mb-2 uppercase tracking-widest">
                <UserIcon className="w-4 h-4" /> Nama Lengkap
              </label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full bg-[#f4fcf7] border-2 border-emerald-100/50 rounded-2xl px-6 py-4 outline-none focus:border-emerald-400 transition-colors font-bold text-gray-800"
                />
              ) : (
                <div className="bg-[#e6fce5] rounded-full px-6 py-4 font-bold text-[#0c5132]">
                  {user.name}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-[#1db372] mb-2 uppercase tracking-widest">
                <EnvelopeIcon className="w-4 h-4" /> Email
              </label>
              {isEditing ? (
                <input 
                  type="email" 
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  className="w-full bg-[#f4fcf7] border-2 border-emerald-100/50 rounded-2xl px-6 py-4 outline-none focus:border-emerald-400 transition-colors font-bold text-gray-800"
                />
              ) : (
                <div className="bg-[#e6fce5] rounded-full px-6 py-4 font-bold text-[#0c5132]">
                  {user.email}
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-[#1db372] mb-2 uppercase tracking-widest">
                <PhoneIcon className="w-4 h-4" /> Nomor Telepon
              </label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editData.phone}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  className="w-full bg-[#f4fcf7] border-2 border-emerald-100/50 rounded-2xl px-6 py-4 outline-none focus:border-emerald-400 transition-colors font-bold text-gray-800"
                />
              ) : (
                <div className="bg-[#e6fce5] rounded-full px-6 py-4 font-bold text-[#0c5132]">
                  {user.phone}
                </div>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-[#1db372] mb-2 uppercase tracking-widest">
                <IdentificationIcon className="w-4 h-4" /> Tipe Akun
              </label>
              <div className="bg-[#f4fcf7] rounded-full px-6 py-4 font-bold text-[#568a73] opacity-80">
                {user.role}
              </div>
            </div>
          </div>
        </div>

        {/* Tips Banner */}
        <div className="mt-8 bg-[#e8fbf1] rounded-[30px] p-6 text-center border border-emerald-100">
           <p className="text-[#1a6b46] font-bold text-sm md:text-base leading-relaxed">
             💚 <span className="font-extrabold mr-1">Tips:</span> Pastikan informasi kontak Anda selalu up-to-date agar kurir dapat menghubungi Anda dengan mudah!
           </p>
        </div>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#0c5132]/40 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)}></div>
          
          <div className="bg-white rounded-[40px] w-full max-w-md p-8 md:p-10 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#e6fce5] rounded-xl flex items-center justify-center text-[#1db372]">
                <LockClosedIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-[#0c5132]">Ganti Password</h3>
            </div>

            <form onSubmit={handlePasswordSave} className="space-y-6">
              {passErrors.global && (
                <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2">
                  <XMarkIcon className="w-4 h-4" /> {passErrors.global}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-emerald-700 mb-2 uppercase tracking-widest">Password Saat Ini</label>
                <input 
                  type="password" 
                  placeholder="Masukkan password saat ini"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className={`w-full bg-[#f4fcf7] rounded-2xl px-5 py-4 outline-none border-2 transition-colors font-bold text-gray-800 ${passErrors.current ? 'border-red-400' : 'border-emerald-50 focus:border-emerald-400'}`}
                />
                {passErrors.current && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase">{passErrors.current}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-700 mb-2 uppercase tracking-widest">Password Baru</label>
                <input 
                  type="password" 
                  placeholder="Minimal 6 karakter"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full bg-[#f4fcf7] border-2 border-emerald-50 rounded-2xl px-5 py-4 outline-none focus:border-emerald-400 transition-colors font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-700 mb-2 uppercase tracking-widest">Konfirmasi Password Baru</label>
                <input 
                  type="password" 
                  placeholder="Ketik ulang password baru"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className={`w-full bg-[#f4fcf7] rounded-2xl px-5 py-4 outline-none border-2 transition-colors font-bold text-gray-800 ${passErrors.confirm ? 'border-red-400' : 'border-emerald-50 focus:border-emerald-400'}`}
                />
                {passErrors.confirm && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase">{passErrors.confirm}</p>}
              </div>

              <button 
                type="submit"
                className="w-full bg-[#1db372] text-white py-4 rounded-2xl font-extrabold shadow-sm hover:bg-[#159a61] transition-all mt-4"
              >
                Simpan Password Baru
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

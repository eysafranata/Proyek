'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import { registerUser } from '@/app/lib/actions';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [kotaAsal, setKotaAsal] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    kota_asal?: string;
    password?: string;
  }>({});

  const validate = () => {
    let isValid = true;
    const newErrors: any = {};

    if (!name.trim()) {
      newErrors.name = "Nama lengkap harus diisi";
      isValid = false;
    }

    if (!email.trim() || !email.includes('@')) {
      newErrors.email = "Email tidak valid atau belum diisi";
      isValid = false;
    }

    if (!phone.trim()) {
      newErrors.phone = "Nomor telepon harus diisi";
      isValid = false;
    }

    if (!kotaAsal.trim()) {
      newErrors.kota_asal = "Kota asal harus diisi";
      isValid = false;
    }

    if (!password || password.length < 8 || password !== confirmPassword) {
      newErrors.password = "Kata sandi minimal 8 karakter dan harus cocok";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('kota_asal', kotaAsal);
    formData.append('password', password);

    try {
      const result = await registerUser(formData);
      if (result && result.error) {
        setErrors({ ...errors, password: result.error });
        setIsSubmitting(false);
      }
    } catch (err: any) {
      if (err.message === 'NEXT_REDIRECT') {
          // Ignore redirect errors as they are expected
          return;
      }
      setErrors({ ...errors, password: 'Gagal melakukan pendaftaran. Silakan coba lagi.' });
      setIsSubmitting(false);
    }
  };

  return (
    <main className={`min-h-screen bg-[#f4fcf7] flex flex-col ${poppins.className}`}>
      
      {/* Header section (Centered Logo + Subtitle) */}
      <div className="pt-12 pb-6 flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 mb-1">
          <Image src="/logo1.jpeg" alt="Logo KirimAja" width={40} height={40} className="object-contain" />
          <span className="text-3xl font-bold text-gray-900 tracking-tight">KirimAja</span>
        </Link>
        <p className="text-[10px] sm:text-xs font-semibold text-gray-500 tracking-widest uppercase">
          Editorial Precision in Motion
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex items-start justify-center px-4 pb-12">
        <div className="bg-[#48cc81] p-8 sm:p-10 rounded-3xl w-full max-w-[480px] shadow-lg relative">
          
          <h2 className="text-[28px] font-extrabold text-gray-900 text-center mb-2 tracking-tight">
            Buat Akun Baru
          </h2>
          <p className="text-gray-800 text-center text-sm font-medium mb-8 px-4 opacity-90">
            Bergabunglah dengan jaringan pengiriman terpercaya kami.
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Nama Lengkap <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Nama Lengkap"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors({ ...errors, name: undefined });
                }}
                className={`w-full px-4 py-3 rounded-2xl outline-none border-2 ring-0 transition-colors ${
                  errors.name 
                    ? 'border-red-500 focus:border-red-500 text-red-900 placeholder-red-300' 
                    : 'border-transparent focus:border-white/50 text-gray-800'
                } bg-[#f8fcf9] shadow-sm`}
              />
              {errors.name && (
                <p className="text-red-700 text-xs font-semibold mt-1.5 ml-1">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Alamat Email <span className="text-red-700">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="nama@contoh.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: undefined });
                }}
                className={`w-full px-4 py-3 rounded-2xl outline-none border-2 ring-0 transition-colors ${
                  errors.email 
                    ? 'border-red-500 focus:border-red-500 text-red-900 placeholder-red-300' 
                    : 'border-transparent focus:border-white/50 text-gray-800'
                } bg-[#f8fcf9] shadow-sm`}
              />
              {errors.email && (
                <p className="text-red-700 text-xs font-semibold mt-1.5 ml-1">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Nomor Telepon <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                name="phone"
                placeholder="0812xxxx"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors({ ...errors, phone: undefined });
                }}
                className={`w-full px-4 py-3 rounded-2xl outline-none border-2 ring-0 transition-colors ${
                  errors.phone 
                    ? 'border-red-500 focus:border-red-500 text-red-900 placeholder-red-300' 
                    : 'border-transparent focus:border-white/50 text-gray-800'
                } bg-[#f8fcf9] shadow-sm`}
              />
              {errors.phone && (
                <p className="text-red-700 text-xs font-semibold mt-1.5 ml-1">{errors.phone}</p>
              )}
            </div>

            {/* Kota Asal Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Kota Asal <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                name="kota_asal"
                placeholder="Contoh: Jakarta"
                value={kotaAsal}
                onChange={(e) => {
                  setKotaAsal(e.target.value);
                  setErrors({ ...errors, kota_asal: undefined });
                }}
                className={`w-full px-4 py-3 rounded-2xl outline-none border-2 ring-0 transition-colors ${
                  errors.kota_asal 
                    ? 'border-red-500 focus:border-red-500 text-red-900 placeholder-red-300' 
                    : 'border-transparent focus:border-white/50 text-gray-800'
                } bg-[#f8fcf9] shadow-sm`}
              />
              {errors.kota_asal && (
                <p className="text-red-700 text-xs font-semibold mt-1.5 ml-1">{errors.kota_asal}</p>
              )}
            </div>

            {/* Passwords Flex Row */}
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Kata Sandi <span className="text-red-700">*</span>
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors({ ...errors, password: undefined });
                    }}
                    className={`w-full pl-4 pr-10 py-3 rounded-2xl outline-none border-2 ring-0 transition-colors ${
                      errors.password 
                        ? 'border-red-500 focus:border-red-500 text-red-900' 
                        : 'border-transparent focus:border-white/50 text-gray-800'
                    } bg-[#f8fcf9] shadow-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Konfirmasi Kata Sandi <span className="text-red-700">*</span>
                </label>
                <div className="relative group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors({ ...errors, password: undefined });
                    }}
                    className={`w-full pl-4 pr-10 py-3 rounded-2xl outline-none border-2 ring-0 transition-colors ${
                      errors.password 
                        ? 'border-red-500 focus:border-red-500 text-red-900' 
                        : 'border-transparent focus:border-white/50 text-gray-800'
                    } bg-[#f8fcf9] shadow-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            {errors.password && (
              <p className="text-red-700 text-xs font-semibold mt-1 ml-1">{errors.password}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-[#157f4e] text-white font-bold py-4 rounded-full hover:bg-[#116e42] transition-colors mt-6 shadow-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'MEMPROSES...' : 'DAFTAR'}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-gray-900 mt-10">
            Sudah punya akun? <Link href="/login" className="font-extrabold hover:text-black">Masuk</Link>
          </p>
        </div>
      </div>

      {/* Footer Minimalist */}
      <footer className="w-full px-8 py-5 text-xs text-gray-400 bg-white border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center mt-auto">
        <div className="mb-4 sm:mb-0">
          <span className="font-extrabold text-gray-800 text-sm mr-2 tracking-tight">KirimAja</span>
          <br className="sm:hidden" />
          <span>© 2026 KirimAja. All rights reserved.</span>
        </div>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-gray-600 font-medium">Privacy Policy</Link>
          <Link href="#" className="hover:text-gray-600 font-medium">Terms of Service</Link>
          <Link href="#" className="hover:text-gray-600 font-medium">Support</Link>
        </div>
      </footer>
    </main>
  );
}

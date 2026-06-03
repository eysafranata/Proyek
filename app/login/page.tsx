'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import { authenticateUser } from '@/app/lib/actions';
import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    global?: string;
  }>({});

  const validate = () => {
    let isValid = true;
    const newErrors: any = {};

    if (!username.trim()) {
      newErrors.username = "Username harus diisi";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Kata sandi salah atau belum diisi";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const result = await authenticateUser(formData);

    if (result.success && result.user) {
      if (result.user.role === 'Admin') {
        window.location.href = '/dashboard-admin';
      } else {
        window.location.href = '/dashboard';
      }
    } else {
      setErrors({
        global: result.error || "Username atau password salah"
      });
    }
  };

  return (
    <main className={`min-h-screen bg-[#f4fcf7] flex flex-col relative overflow-hidden ${poppins.className}`}>
      {/* Animated Floating Ambient Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#48cc81]/10 blur-[120px] animate-pulse duration-[6000ms]"></div>
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-[#1b8555]/10 blur-[130px] animate-pulse duration-[8000ms]"></div>
      </div>

      {/* Navbar Minimalist */}
      <nav className="flex items-center justify-between px-8 py-4 bg-transparent relative z-10">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo1.jpeg" alt="Logo KirimAja" width={32} height={32} className="object-contain rounded-lg" />
          <span className="text-xl font-extrabold text-[#0c5132]">KirimAja</span>
        </Link>
        <Link href="/" className="text-emerald-700 hover:text-emerald-950 font-bold text-sm transition-colors">
          Kembali ke Beranda
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-4 relative z-10">
        <div className="bg-gradient-to-br from-[#48cc81] to-[#39be76] p-8 sm:p-10 rounded-[32px] w-full max-w-md relative pb-10 shadow-[0_20px_50px_rgba(27,133,85,0.18)] border border-white/20 z-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
          
          <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-950 text-center mb-2 tracking-tight">
            KirimAja <span className="inline-block animate-bounce">📦</span>
          </h2>
          <p className="text-emerald-950/85 text-center text-sm font-medium mb-8 px-4 opacity-90 leading-relaxed">
            Silakan masuk untuk mengelola pengiriman terbaik Anda.
          </p>

          {/* Global Error Banner */}
          {errors.global && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold py-3.5 px-4 rounded-2xl flex items-center gap-2.5 mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errors.global}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-emerald-950 uppercase tracking-widest mb-2 ml-1">
                Username <span className="text-red-700">*</span>
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0c5132]/60 group-focus-within:text-[#0c5132] transition-colors pointer-events-none z-10">
                  <UserIcon className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  placeholder="e.g bima"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrors({ ...errors, username: undefined, global: undefined });
                  }}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none border-2 transition-all duration-300 ${
                    errors.username 
                      ? 'border-red-400 focus:border-red-500 text-red-900 placeholder-red-300 bg-red-50/50' 
                      : 'border-transparent focus:border-white text-gray-800'
                  } bg-white shadow-sm hover:shadow-md focus:shadow-md font-semibold text-sm`}
                />
              </div>
              {errors.username && (
                <p className="text-red-800 text-[10px] font-bold mt-1.5 ml-2 uppercase tracking-wider">{errors.username}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-xs font-black text-emerald-950 uppercase tracking-widest">
                  Password <span className="text-red-700">*</span>
                </label>
                <Link href="/forgot-password" className="text-xs font-extrabold text-emerald-950 hover:text-white transition-colors duration-200">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0c5132]/60 group-focus-within:text-[#0c5132] transition-colors pointer-events-none z-10">
                  <LockClosedIcon className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: undefined, global: undefined });
                  }}
                  className={`w-full pl-12 pr-12 py-3.5 rounded-2xl outline-none border-2 transition-all duration-300 ${
                    errors.password 
                      ? 'border-red-400 focus:border-red-500 text-red-900 bg-red-50/50' 
                      : 'border-transparent focus:border-white text-gray-800'
                  } bg-white shadow-sm hover:shadow-md focus:shadow-md font-semibold text-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0c5132] focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-800 text-[10px] font-bold mt-1.5 ml-2 uppercase tracking-wider">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#1b8555] text-white font-bold py-4 rounded-2xl hover:bg-[#125e3b] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-2 shadow-md hover:shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-sm font-semibold text-emerald-950 mt-10">
            Belum punya akun? <Link href="/register" className="font-black text-emerald-950 underline decoration-2 underline-offset-4 hover:text-white transition-colors">Daftar sekarang</Link>
          </p>
        </div>
      </div>

      {/* Footer Minimalist */}
      <footer className="w-full px-12 py-6 text-xs text-gray-400 bg-transparent flex justify-between items-center relative z-10">
        <div>
          <span className="font-bold text-gray-500 mr-2">KirimAja</span>
          <span>© 2026 KirimAja . All rights reserved.</span>
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

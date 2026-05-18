'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import { authenticateUser } from '@/app/lib/actions';

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
    } else if (password.length < 8) {
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
        router.push('/dashboard-admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      setErrors({
        global: result.error || "Username atau password salah"
      });
    }
  };

  return (
    <main className={`min-h-screen bg-[#f4fcf7] flex flex-col ${poppins.className}`}>
      {/* Navbar Minimalist */}
      <nav className="flex items-center justify-between px-8 py-4 bg-transparent">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo1.jpeg" alt="Logo KirimAja" width={32} height={32} className="object-contain" />
          <span className="text-xl font-bold text-gray-800">KirimAja</span>
        </Link>
        <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
          Kembali ke Beranda
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-[#48cc81] p-8 sm:p-10 rounded-3xl w-full max-w-md relative pb-10">
          
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-1">Welcome to KirimAja</h2>
          <p className="text-gray-800 text-center text-sm font-medium mb-8 px-4 opacity-90">
            Enter your credentials to manage your curated shipments.
          </p>

          {/* Global Error Banner (Image 4) */}
          {errors.global && (
            <div className="bg-white border border-red-200 text-red-600 text-sm py-2 px-3 rounded flex items-center gap-2 mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errors.global}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Username<span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g bima"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrors({ ...errors, username: undefined, global: undefined });
                }}
                className={`w-full px-4 py-3 rounded-2xl outline-none border-2 ring-0 transition-colors ${
                  errors.username 
                    ? 'border-red-500 focus:border-red-500 text-red-900 placeholder-red-300' 
                    : 'border-transparent focus:border-white/50 text-gray-800'
                } bg-white shadow-sm`}
              />
              {errors.username && (
                <p className="text-red-600 text-xs font-semibold mt-1.5 ml-1">{errors.username}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-gray-900">
                  Password<span className="text-red-600">*</span>
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-gray-900 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: undefined, global: undefined });
                  }}
                  className={`w-full px-4 py-3 rounded-2xl outline-none border-2 ring-0 transition-colors pr-12 ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-500 text-red-900' 
                      : 'border-transparent focus:border-white/50 text-gray-800'
                  } bg-white shadow-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-xs font-semibold mt-1.5 ml-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#1b8555] text-white font-semibold py-3.5 rounded-full hover:bg-[#156e43] transition-colors mt-2 shadow-sm"
            >
              SIGN IN
            </button>
          </form>



          <p className="text-center text-sm font-medium text-gray-900 mt-10">
            Don't have an account? <Link href="/register" className="font-extrabold underline decoration-2 underline-offset-4 hover:text-black">Create one</Link>
          </p>
        </div>
      </div>

      {/* Footer Minimalist */}
      <footer className="w-full px-12 py-6 text-xs text-gray-400 bg-transparent flex justify-between items-center">
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

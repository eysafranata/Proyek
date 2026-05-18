'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errorToast, setErrorToast] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorToast('');
    setSuccessToast('');

    if (!emailOrUsername.trim()) {
      setErrorToast('Email/Username tidak boleh kosong.');
      return;
    }

    if (emailOrUsername.toLowerCase() === 'salah') {
      setErrorToast('Email/username tidak ditemukan. Pastikan Anda sudah terdaftar.');
    } else {
      setSuccessToast(`Link reset password sudah dikirim ke ${emailOrUsername}. Silakan cek email Anda.`);
      setStep(2);
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorToast('');
    setSuccessToast('');

    if (newPassword.length < 6) {
      setErrorToast('Password harus minimal 6 karakter.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setErrorToast('Konfirmasi password tidak cocok.');
      return;
    }

    // Success logic for demo (redirecting back to login)
    router.push('/login');
  };

  return (
    <main className={`min-h-screen bg-gradient-to-b from-[#d5f3e2] to-[#e4f8ed] flex flex-col items-center justify-center p-4 relative overflow-hidden ${poppins.className}`}>
      
      {/* Toast Overlay Container */}
      <div className="absolute top-8 left-0 right-0 flex justify-center z-50 pointer-events-none px-4">
        {errorToast && (
          <div className="bg-white px-5 py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex items-center gap-4 min-w-[320px] max-w-[400px] animate-in fade-in slide-in-from-top-4 pb-4">
            <div className="bg-black text-white w-6 h-6 rounded-full flex flex-shrink-0 items-center justify-center font-bold text-sm">
              !
            </div>
            <span className="text-[14px] font-semibold text-gray-900 leading-snug">{errorToast}</span>
          </div>
        )}
        
        {successToast && (
          <div className="bg-white px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex items-center gap-4 min-w-[320px] max-w-[450px] animate-in fade-in slide-in-from-top-4">
            <div className="bg-black text-white w-6 h-6 rounded-full flex flex-shrink-0 items-center justify-center font-bold text-[10px]">
              ✔
            </div>
            <span className="text-[14px] font-semibold text-gray-900 leading-snug">{successToast}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center mb-8 z-10 w-full max-w-md pt-16">
        <div className="flex items-center gap-2 mb-4">
          <Image src="/logo1.jpeg" alt="Logo" width={40} height={40} className="object-contain rounded-lg" />
          <span className="text-3xl font-extrabold text-[#0d5935] tracking-tight">KirimAja</span>
        </div>
        {step === 1 && (
          <p className="text-gray-500 font-medium tracking-wide">
            Lupa Password? Tenang, kami bantu! <span className="text-xl">🔐</span>
          </p>
        )}
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-[32px] w-full max-w-[450px] shadow-sm z-10 relative">
        <div className="w-[72px] h-[72px] bg-[#eef8f3] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#1ebc71]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964a6 6 0 119.836-9.742z" />
          </svg>
        </div>

        {step === 1 ? (
          <>
            <h2 className="text-2xl font-bold text-[#146f42] text-center mb-3">Reset Password</h2>
            <p className="text-gray-500 text-center text-[15px] mb-8">
              Masukkan email atau username untuk reset password
            </p>

            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#146f42] mb-2.5">
                  Email atau Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-[22px] w-[22px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="email@example.com atau username"
                    value={emailOrUsername}
                    onChange={(e) => {
                      setEmailOrUsername(e.target.value);
                      setErrorToast('');
                    }}
                    className="pl-12 w-full px-4 py-3.5 rounded-2xl outline-none border border-gray-200 focus:border-[#1ebc71] focus:ring-1 focus:ring-[#1ebc71] text-gray-800 placeholder-gray-400 font-medium transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1ebc71] hover:bg-[#1aab65] text-white py-3.5 rounded-full font-bold text-[15px] transition-colors shadow-sm"
              >
                Kirim Link Reset
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-[#146f42] text-center mb-3">Buat Password Baru</h2>
            <p className="text-gray-500 text-center text-[15px] mb-8">
              Password baru Anda harus minimal 6 karakter
            </p>

            <form onSubmit={handleStep2Submit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#146f42] mb-2.5">
                  Password Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="Masukkan password baru"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrorToast('');
                    }}
                    className="pl-11 w-full px-4 py-3.5 rounded-2xl outline-none border border-gray-200 focus:border-[#1ebc71] focus:ring-1 focus:ring-[#1ebc71] text-gray-800 placeholder-gray-400 font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#146f42] mb-2.5">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="Ketik ulang password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrorToast('');
                    }}
                    className="pl-11 w-full px-4 py-3.5 rounded-2xl outline-none border border-gray-200 focus:border-[#1ebc71] focus:ring-1 focus:ring-[#1ebc71] text-gray-800 placeholder-gray-400 font-medium transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1ebc71] hover:bg-[#1aab65] text-white py-3.5 rounded-full font-bold text-[15px] transition-colors shadow-sm mt-8"
              >
                Reset Password
              </button>
            </form>
          </>
        )}

        <div className="mt-8 text-center">
          <Link href="/login" className="text-gray-500 font-medium hover:text-gray-800 transition-colors text-[15px]">
            ← Kembali ke Login
          </Link>
        </div>
      </div>

      <div className="absolute bottom-6 w-full text-center">
        <p className="text-[13px] font-medium text-gray-500/80">
          © 2026 KirimAja - Pengiriman UMKM Terpercaya
        </p>
      </div>

    </main>
  );
}

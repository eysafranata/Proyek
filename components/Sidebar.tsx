'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleBottomCenterTextIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { logoutUser, getCurrentUser } from '@/app/lib/actions';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      const data = await getCurrentUser();
      if (data) {
        setUser(data);
      }
    }
    if (isOpen) {
      loadUser();
    }
  }, [isOpen]);

  const navigation = [
    { name: 'Beranda', href: '/dashboard', icon: HomeIcon },
    { name: 'Lacak Paket', href: '/lacak-paket', icon: MapPinIcon },
    { name: 'Riwayat', href: '/dashboard/riwayat', icon: ClockIcon },
    { name: 'Feedback & Keluhan', href: '/dashboard/feedback', icon: ChatBubbleBottomCenterTextIcon },
    { name: 'Profil', href: '/dashboard/profile', icon: UserIcon },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-[60] transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 left-0 h-full w-[280px] bg-white z-[70] transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Profile / Header Section */}
        <div className="p-6 border-b border-gray-50 bg-gradient-to-br from-[#f4fcf7] to-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          
          {user ? (
            <div className="flex items-center gap-4 mt-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm overflow-hidden bg-[#1b8555]">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <h2 className="font-extrabold text-[#0c5132] text-sm leading-tight">{user.name}</h2>
                <p className="text-[11px] text-[#24a173] font-medium">{user.role || 'Pelanggan'}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Image src="/logo1.jpeg" alt="Logo" width={36} height={36} className="object-contain rounded" />
              <div>
                <h2 className="text-xl font-extrabold text-[#0c5132] tracking-tight leading-tight">KirimAja</h2>
                <p className="text-[10px] font-medium text-gray-500">Pengiriman Terpercaya</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                      isActive 
                        ? 'bg-[#e7f8ef] text-[#1db372]' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-[#1db372]' : 'text-gray-500'}`} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer (Logout) */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={async () => {
              await logoutUser();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#d93025] hover:bg-red-50 transition-colors font-bold text-sm"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            Keluar
          </button>
        </div>
      </div>
    </>
  );
}

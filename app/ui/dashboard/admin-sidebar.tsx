'use client';

import { useState, useEffect } from 'react';

import { 
  XMarkIcon, 
  Squares2X2Icon, 
  CubeIcon, 
  UsersIcon, 
  ChartBarIcon, 
  ExclamationCircleIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import { getCurrentUser, logoutUser } from '@/app/lib/actions';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    async function loadUser() {
      const data = await getCurrentUser();
      if (data) {
        setAdminName(data.name);
      }
    }
    loadUser();
  }, []);

  const menuItems = [
    { name: 'Dashboard Admin', href: '/dashboard-admin', icon: Squares2X2Icon },
    { name: 'Tambah Paket', href: '/dashboard-admin/add-package', icon: CubeIcon },
    { name: 'Kelola User', href: '/dashboard-admin/users', icon: UsersIcon },
    { name: 'Laporan', href: '/dashboard-admin/laporan-kinerja', icon: ChartBarIcon },
    { name: 'Keluhan', href: '#', icon: ExclamationCircleIcon },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-[60] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white z-[70] transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Profile Section */}
        <div className="p-6 border-b border-gray-50 bg-gradient-to-br from-[#f4fcf7] to-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4 mt-2">
            <div className="w-12 h-12 rounded-full bg-[#1b8555] flex items-center justify-center text-white font-bold text-xl shadow-sm">
              {adminName.charAt(0)}
            </div>
            <div>
              <h2 className="font-extrabold text-[#0c5132] text-sm leading-tight">{adminName}</h2>
              <p className="text-[11px] text-[#24a173] font-medium">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-[#e6fce5] text-[#1b8555] shadow-sm' 
                    : 'text-[#4b5563] hover:bg-gray-50'
                }`}
                onClick={onClose}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-[#1b8555]' : 'text-gray-400 group-hover:text-gray-500'}`} strokeWidth={2} />
                <span className={`text-[13px] font-bold ${isActive ? 'text-[#0c5132]' : ''}`}>{item.name}</span>
              </Link>
            );
          })}

          <div className="mt-4 pt-4 border-t border-gray-100/50">
            <button
              onClick={async () => {
                await logoutUser();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 group"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 text-red-400 group-hover:text-red-500" strokeWidth={2} />
              <span className="text-[13px] font-bold">Keluar dari Admin</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-50 bg-[#fafafa]/50">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#e6fce5] flex items-center justify-center">
              <CubeIcon className="w-4 h-4 text-[#1b8555]" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-extrabold text-[#0c5132]">KirimAja Admin v1.0</p>
              <p className="text-[9px] text-gray-400 font-medium">Sistem Pengiriman UMKM</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

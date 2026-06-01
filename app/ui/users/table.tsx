'use client';

import { useState } from 'react';
import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { deleteUser } from '@/app/lib/actions';

export default function UsersTable({ users }: { users: any[] }) {
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async (id: string) => {
    setIsDeleting(true);
    await deleteUser(id);
    setIsDeleting(false);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-400 text-xs uppercase tracking-widest font-bold">
              <th className="px-8 py-5">Nama</th>
              <th className="px-8 py-5">Email</th>
              <th className="px-8 py-5">Peran</th>
              <th className="px-8 py-5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-[#fcfdfc] transition-colors group">
                  <td className="px-8 py-6">
                    <span className="font-bold text-[#0c5132]">{user.name}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-gray-500 font-medium">{user.email}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      user.role === 'Admin' 
                        ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-4">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="text-gray-400 hover:text-[#24a173] font-bold text-sm transition-colors"
                      >
                        Detail
                      </button>
                      <button 
                        onClick={() => setDeletingUser(user)}
                        disabled={isDeleting}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-medium">
                  Tidak ada pengguna ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-[#0c5132]/20 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          ></div>
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold text-[#0c5132]">Detail Pengguna</h3>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-[#f8faf9] rounded-2xl">
                  <div className="w-14 h-14 bg-[#e6fce5] rounded-full flex items-center justify-center text-[#24a173] text-xl font-bold">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Nama Lengkap</p>
                    <p className="font-extrabold text-[#0c5132] text-lg leading-tight">{selectedUser.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 px-2">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Email</p>
                    <p className="text-[#0c5132] font-semibold">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Nomor Telepon</p>
                    <p className="text-[#0c5132] font-semibold">{selectedUser.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Peran Akses</p>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      selectedUser.role === 'Admin' 
                        ? 'bg-purple-50 text-purple-600' 
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Terdaftar Pada</p>
                    <p className="text-gray-500 font-medium">
                      {new Date(selectedUser.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedUser(null)}
                  className="w-full bg-[#24a173] text-white py-4 rounded-[20px] font-bold hover:bg-[#1b8555] transition-all shadow-sm mt-4"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-[#0c5132]/20 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setDeletingUser(null)}
          ></div>
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl relative z-10 overflow-hidden p-6 md:p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 border border-red-100">
              <TrashIcon className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-extrabold text-[#0c5132] mb-3">Konfirmasi Hapus</h3>
            <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus user <span className="font-extrabold text-red-500">"{deletingUser.name}"</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingUser(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all text-sm"
              >
                Batal
              </button>
              <button 
                onClick={async () => {
                  const id = deletingUser.id;
                  setDeletingUser(null);
                  await confirmDelete(id);
                }}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-1.5"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

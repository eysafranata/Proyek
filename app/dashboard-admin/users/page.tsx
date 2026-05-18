import Link from 'next/link';
import { ArrowLeftIcon, UserPlusIcon, UserIcon } from '@heroicons/react/24/outline';
import { fetchFilteredUsers, fetchUsersPages } from '@/app/lib/actions';
import UsersLayoutWrapper from '@/app/ui/users/layout-wrapper';
import Search from '@/app/ui/search';
import Pagination from '@/app/ui/pagination';
import UsersTable from '@/app/ui/users/table';
import { UsersTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';

async function UsersTableWrapper({ query, currentPage }: { query: string; currentPage: number }) {
  const users = await fetchFilteredUsers(query, currentPage);
  return <UsersTable users={users} />;
}

export default async function ManageUsersPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const totalPages = await fetchUsersPages(query);

  return (
    <UsersLayoutWrapper>
      <div className="px-6 md:px-10 py-8 max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link 
              href="/dashboard-admin" 
              className="inline-flex items-center text-[#24a173] font-bold text-sm mb-4 hover:underline gap-1.5"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Kembali ke Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-[#0c5132] flex items-center gap-2">
              Kelola Pengguna 👥
            </h1>
            <p className="text-gray-500 font-medium">Lihat dan atur akun pelanggan/admin</p>
          </div>
          
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center gap-2 bg-[#24a173] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#1b8555] transition-all shadow-sm hover:shadow-md"
          >
            <UserPlusIcon className="w-5 h-5" />
            Tambah User
          </Link>
        </div>

        {/* Search & Table Card */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#e6fce5] p-2 rounded-xl">
                 <UserIcon className="w-5 h-5 text-[#24a173]" />
              </div>
              <h2 className="font-extrabold text-[#0c5132]">Daftar Pengguna</h2>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search placeholder="Cari nama/email..." />
            </div>
          </div>

          <Suspense key={query + currentPage} fallback={<UsersTableSkeleton />}>
            <UsersTableWrapper query={query} currentPage={currentPage} />
          </Suspense>

          <div className="mt-5 flex w-full justify-center pb-6 pt-2">
            <Pagination totalPages={totalPages} />
          </div>
        </div>
      </div>
    </UsersLayoutWrapper>
  );
}

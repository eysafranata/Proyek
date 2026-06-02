import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dasbor Admin',
  description: 'Kelola data armada, paket pelanggan, keluhan, dan laporan kinerja operasional KirimAja secara terpusat.',
};

export default function DashboardAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

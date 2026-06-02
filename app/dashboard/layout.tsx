import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dasbor Pelanggan',
  description: 'Kelola kiriman paket Anda, lihat riwayat pengiriman, dan kirim masukan dengan mudah melalui Dasbor KirimAja.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

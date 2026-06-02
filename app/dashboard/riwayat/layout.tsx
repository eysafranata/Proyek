import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Riwayat Pengiriman',
  description: 'Pantau daftar pengiriman paket yang telah Anda lakukan sebelumnya di KirimAja.',
};

export default function RiwayatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Laporan Kinerja',
  description: 'Analisis performa bisnis, efisiensi kurir, rata-rata waktu kirim, dan statistik operasional KirimAja.',
};

export default function LaporanKinerjaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

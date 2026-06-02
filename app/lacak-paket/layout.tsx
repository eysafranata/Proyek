import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lacak Paket',
  description: 'Lacak status perjalanan pengiriman paket Anda secara real-time dengan nomor resi KirimAja.',
};

export default function LacakPaketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

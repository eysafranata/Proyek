import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kelola Paket',
  description: 'Kelola seluruh status pengiriman paket, edit detail transaksi, dan distribusikan paket ke armada kendaraan.',
};

export default function PackagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

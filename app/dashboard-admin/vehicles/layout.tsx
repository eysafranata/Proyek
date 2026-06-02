import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kelola Kendaraan',
  description: 'Atur daftar dan status operasional armada kendaraan pengiriman KirimAja.',
};

export default function VehiclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

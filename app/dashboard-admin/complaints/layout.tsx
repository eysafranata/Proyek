import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kelola Keluhan',
  description: 'Pantau keluhan pelanggan, berikan tanggapan, dan selesaikan kendala pengiriman dengan responsif.',
};

export default function ComplaintsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

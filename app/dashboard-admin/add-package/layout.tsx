import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tambah Paket Baru',
  description: 'Form pendaftaran dan input paket baru ke dalam sistem logistik KirimAja.',
};

export default function AddPackageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

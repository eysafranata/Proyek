import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profil Saya',
  description: 'Lihat dan edit informasi profil akun Anda di KirimAja.',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

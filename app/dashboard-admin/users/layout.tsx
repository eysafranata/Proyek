import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kelola Pengguna',
  description: 'Atur hak akses, registrasi pengguna baru, dan pantau status akun pengguna sistem KirimAja.',
};

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

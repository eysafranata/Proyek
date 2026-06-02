import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daftar Akun Baru',
  description: 'Daftar akun KirimAja sekarang dan nikmati kemudahan pengiriman paket dengan tarif bersahabat untuk bisnis UMKM Anda.',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

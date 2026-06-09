import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Masuk Akun',
  description: 'Masuk ke portal KirimAja untuk mengelola pengiriman, memantau paket, dan melihat laporan kinerja Anda.',
};
  
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | KirimAja',
    default: 'KirimAja - Solusi Pengiriman Paket Terpercaya UMKM Indonesia',
  },
  description: 'Solusi pengiriman paket mudah, cepat, dan terpercaya dengan harga bersahabat untuk UMKM Indonesia.',
  keywords: ['KirimAja', 'pengiriman paket', 'cargo murah', 'ekspedisi UMKM', 'tracking paket'],
  metadataBase: new URL('https://kirimaja.id'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}

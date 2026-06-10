import { Metadata } from 'next';
import LandingPageClient from '@/components/LandingPageClient';

export const metadata: Metadata = {
  title: 'KirimAja - Kirim Paket Mudah, Harga Bersahabat!',
  description: 'Solusi Pengiriman Terpercaya untuk UMKM Indonesia. Nikmati kemudahan kirim paket reguler, express, dan cargo dengan harga paling bersahabat.',
};

export default function Page() {
  return <LandingPageClient />;
}
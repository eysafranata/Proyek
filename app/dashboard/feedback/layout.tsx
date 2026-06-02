import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kirim Masukan',
  description: 'Bantu kami meningkatkan kualitas layanan pengiriman dengan mengirimkan masukan atau feedback Anda.',
};

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lupa Kata Sandi',
  description: 'Atur ulang kata sandi akun KirimAja Anda dengan mudah dan aman.',
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

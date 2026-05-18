import Image from 'next/image';

export default function AcmeLogo() {
  return (
    <div className="flex flex-row items-center gap-3 leading-none text-white">
      <Image src="/logo1.jpeg" alt="Logo KirimAja" width={40} height={40} className="object-contain rounded-lg" />
      <p className="text-[28px] font-extrabold tracking-tight">KirimAja</p>
    </div>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export default function Page() {
  return (
    <main className={`min-h-screen bg-[#f4fcf7] ${poppins.className} text-gray-800`}>
      
      {/* 1. NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          
          <Image 
            src="/logo1.jpeg" 
            alt="Logo KirimAja" 
            width={40} 
            height={40} 
            className="object-contain" 
          />
          
          {/* --- BAGIAN INI YANG DIUBAH --- */}
          <div>
            <h1 className="text-xl font-bold text-gray-800 leading-tight">KirimAja</h1>
            <p className="text-xs text-gray-500">Pengiriman Terpercaya</p>
          </div>
          {/* ----------------------------- */}

        </div>
        <div className="flex items-center gap-6 font-medium">
          <Link href="/login" className="text-gray-600 hover:text-emerald-600">Masuk</Link>
          <Link href="/register" className="bg-emerald-500 text-white px-5 py-2 rounded-full hover:bg-emerald-600 transition-colors">
            Daftar Gratis
          </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION & STATS */}
      <section className="px-8 py-20 text-center max-w-5xl mx-auto">
        <h1 className="text-5xl font-extrabold text-[#1a6b46] mb-4 leading-tight">
          Kirim Paket Mudah, <br /> Harga Bersahabat!
        </h1>
        <p className="text-gray-500 text-lg mb-2">Solusi Pengiriman Terpercaya untuk UMKM Indonesia</p>
        <p className="text-emerald-500 font-semibold text-lg mb-8">"Teman Setia Bisnis Anda Berkembang" 💚</p>
        
        <div className="flex justify-center gap-4 mb-16">
          <button className="bg-emerald-500 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-emerald-600">
            Mulai Sekarang <span>→</span>
          </button>
          <button className="border border-emerald-200 bg-emerald-50/50 text-emerald-700 px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-emerald-100">
            📦 Tracking Paket
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { value: "10,000+", label: "Paket Terkirim" },
            { value: "5,000+", label: "UMKM Bergabung" },
            { value: "4.8/5", label: "Rating Pelanggan" },
            { value: "98%", label: "On-Time Delivery" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50">
              <h3 className="text-3xl font-bold text-emerald-500 mb-1">{stat.value}</h3>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Duplicate HERO SECTION removed */}

      {/* 3. FITUR SECTION */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1a6b46] mb-3">Kenapa Pilih KirimAja?</h2>
          <p className="text-gray-500 text-lg">Kami memahami kebutuhan UMKM Indonesia</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: "🚚", title: "Pengiriman Cepat", desc: "Layanan express 1 hari sampai untuk area Jawa" },
            { icon: "🛡️", title: "Asuransi Paket", desc: "Semua paket diasuransikan hingga Rp 5 juta" },
            { icon: "🕒", title: "Tracking Real-Time", desc: "Pantau paket Anda kapan saja, dimana saja" },
            { icon: "👥", title: "Support 24/7", desc: "Tim kami siap membantu Anda setiap saat" }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-[#ebf7f0] text-emerald-600 rounded-full flex items-center justify-center text-2xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-[#1a6b46] mb-2">{feature.title}</h3>
              <p className="text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. JENIS LAYANAN (PRICING) SECTION */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1a6b46] mb-3">Jenis Layanan Kami</h2>
          <p className="text-gray-500 text-lg">Pilih paket sesuai kebutuhan bisnis Anda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Paket Reguler */}
              <div className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-emerald-500 transition-colors shadow-sm text-center">
                <h3 className="text-xl font-bold text-[#1a6b46] mb-2">Paket Reguler</h3>
                <p className="text-gray-500 text-sm mb-1 font-medium">Mulai dari</p>
                <div className="text-4xl font-extrabold text-emerald-500 mb-2">Rp 15.000</div>
                <p className="text-gray-500 text-sm mb-6">1-5 kg • 2-3 hari</p>
                <ul className="text-left space-y-4 mb-8 text-gray-600">
                  <li className="flex gap-2"><span>✅</span> Tracking real-time</li>
                  <li className="flex gap-2"><span>✅</span> Asuransi paket</li>
                  <li className="flex gap-2"><span>✅</span> Customer support 24/7</li>
                </ul>
                <button className="w-full bg-emerald-500 text-white py-3 rounded-xl font-medium hover:bg-emerald-600">Pilih Paket</button>
              </div>

              {/* Paket Express */}
              <div className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-emerald-500 transition-colors shadow-sm text-center">
                <h3 className="text-xl font-bold text-[#1a6b46] mb-2">Paket Express</h3>
                <p className="text-gray-500 text-sm mb-1 font-medium">Mulai dari</p>
                <div className="text-4xl font-extrabold text-emerald-500 mb-2">Rp 25.000</div>
                <p className="text-gray-500 text-sm mb-6">1-10 kg • 1 hari</p>
                <ul className="text-left space-y-4 mb-8 text-gray-600">
                  <li className="flex gap-2"><span>✅</span> Prioritas pengiriman</li>
                  <li className="flex gap-2"><span>✅</span> Tracking real-time</li>
                  <li className="flex gap-2"><span>✅</span> Asuransi paket</li>
                  <li className="flex gap-2"><span>✅</span> Same day delivery</li>
                </ul>
                <button className="w-full bg-emerald-500 text-white py-3 rounded-xl font-medium hover:bg-emerald-600">Pilih Paket</button>
              </div>

              {/* Paket Cargo */}
              <div className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-emerald-500 transition-colors shadow-sm text-center">
                <h3 className="text-xl font-bold text-[#1a6b46] mb-2">Paket Cargo</h3>
                <p className="text-gray-500 text-sm mb-1 font-medium">Mulai dari</p>
                <div className="text-4xl font-extrabold text-emerald-500 mb-2">Rp 50.000</div>
                <p className="text-gray-500 text-sm mb-6">11-50 kg • 3-5 hari</p>
                <ul className="text-left space-y-4 mb-8 text-gray-600">
                  <li className="flex gap-2"><span>✅</span> Untuk barang besar</li>
                  <li className="flex gap-2"><span>✅</span> Tracking real-time</li>
                  <li className="flex gap-2"><span>✅</span> Asuransi penuh</li>
                  <li className="flex gap-2"><span>✅</span> Handling khusus</li>
                </ul>
                <button className="w-full bg-emerald-500 text-white py-3 rounded-xl font-medium hover:bg-emerald-600">Pilih Paket</button>
              </div>
            </div>
      </section>

      {/* 5. CALL TO ACTION & FOOTER */}
      <section className="bg-[#1eb572] py-20 text-center px-8">
        <h2 className="text-4xl font-bold text-white mb-4">Siap Tingkatkan Bisnis Anda?</h2>
        <p className="text-emerald-50 text-lg mb-8">Bergabung dengan ribuan UMKM yang sudah mempercayai kami!</p>
        <div className="flex justify-center gap-4">
          <Link href="/register" className="bg-[#e2f7eb] text-[#1a6b46] px-6 py-3 rounded-full font-semibold hover:bg-white transition-colors">
            Daftar Gratis Sekarang
          </Link>
          <button className="bg-white/20 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-white/30 transition-colors">
            ✉️ Hubungi Kami
          </button>
        </div>
      </section>

      <footer className="bg-white py-10 text-center border-t border-gray-100">
        <div className="flex justify-center items-center gap-2 mb-4">
          
          <Image 
            src="/logo1.jpeg" 
            alt="Logo KirimAja" 
            width={32} 
            height={32} 
            className="object-contain" 
          />
          
          <h3 className="text-xl font-bold text-[#1a6b46]">KirimAja</h3>
        </div>
        <p className="text-gray-500 mb-2">Solusi Pengiriman UMKM Terpercaya</p>
        <p className="text-gray-400 text-sm">© 2024 CargoKu Lite. All rights reserved.</p>
      </footer>

    </main>
  );
}
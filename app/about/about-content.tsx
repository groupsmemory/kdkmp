'use client';

import ThemeToggle from '@/components/ThemeToggle';

export default function AboutContent() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <header style={{ borderBottom: '4px solid var(--border-primary)' }}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex justify-between items-start mb-6">
            <span
              className="inline-block text-xs font-mono uppercase tracking-widest px-3 py-1"
              style={{ backgroundColor: 'var(--bg-invert)', color: 'var(--text-invert)' }}
            >
              Tentang Kami
            </span>
            <ThemeToggle />
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
            JASASAJA
          </h1>
          <p className="text-lg mt-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Platform SaaS manajemen operasional Koperasi Desa dan Kelurahan Merah Putih (KDKMP)
            di bawah binaan PT Agrinas Pangan Nusantara (Persero).
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">

        {/* Latar Belakang */}
        <Section title="Latar Belakang">
          <p>
            Instruksi Presiden Nomor 17 Tahun 2025 tentang Percepatan Pembangunan Fisik Gerai,
            Pergudangan dan Perlengkapan Koperasi Desa/Kelurahan Merah Putih memandatkan
            pembangunan jaringan koperasi desa di seluruh Indonesia. PT Agrinas Pangan Nusantara
            (Persero) — BUMN yang bertransformasi dari PT Yodya Karya di bawah portofolio
            Danantara — ditugaskan memimpin operasionalisasi program ini.
          </p>
          <p>
            Kabupaten Pamekasan, Madura, dipilih sebagai lokasi pilot project dengan target
            189 gerai percontohan di 13 kecamatan. Dari jumlah tersebut, 35 gerai telah selesai
            100% pembangunan fisiknya bersama Kodim setempat, sementara 145 lainnya dalam proses
            penyelesaian.
          </p>
          <p>
            <strong>JASASAJA</strong> hadir sebagai solusi teknologi tunggal yang menjembatani
            transisi dari pembangunan fisik gerai menuju pengelolaan bisnis riil yang sehat,
            transparan, dan siap audit.
          </p>
        </Section>

        {/* Masalah yang Diselesaikan */}
        <Section title="Masalah yang Diselesaikan">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProblemCard
              title="Pencatatan Manual Rawan Manipulasi"
              description="Koperasi pedesaan masih menggunakan buku besar fisik yang rentan rusak, hilang, dan dimanipulasi. Tidak ada rekonsiliasi kas seketika."
            />
            <ProblemCard
              title="Blank Spot Internet di Pedesaan"
              description="Wilayah perbukitan Pamekasan Utara (Pakong, Pegantenan, Batumarmar) masih memiliki banyak area tanpa sinyal seluler."
            />
            <ProblemCard
              title="Laporan Keuangan Tidak Standar"
              description="Pengurus koperasi desa umumnya tidak memiliki kompetensi akuntansi SAK EP yang diwajibkan per 1 Januari 2025."
            />
            <ProblemCard
              title="Penumpukan Kas Tunai Berisiko"
              description="Tanpa kontrol digital, kas tunai brankas gerai sering melebihi batas aman Rp50 juta — menciptakan risiko penggelapan dan pencurian."
            />
            <ProblemCard
              title="Tidak Ada Visibilitas untuk BUMN Induk"
              description="PT Agrinas tidak memiliki dasbor pemantauan real-time untuk mendeteksi inefisiensi atau penyimpangan di 189 gerai."
            />
            <ProblemCard
              title="Eksploitasi Petani oleh Tengkulak"
              description="Penilaian mutu tembakau dan garam dilakukan secara subjektif oleh tengkulak (bandol), merugikan petani Pamekasan."
            />
          </div>
        </Section>

        {/* Solusi Teknologi */}
        <Section title="Arsitektur Solusi">
          <p>
            JASASAJA dirancang sebagai platform hibrida yang mengawinkan fungsi operasional
            gerai ritel pangan, logistik pupuk, dan audit BUMN dalam satu ekosistem tertutup.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <FeatureCard icon="🔒" title="Enkripsi AES-GCM 256-bit" desc="Data transaksi lokal dilindungi enkripsi tingkat militer. Perangkat yang dicuri tidak bisa dibaca." />
            <FeatureCard icon="📡" title="Offline-First Architecture" desc="POS berjalan penuh tanpa internet. Sinkronisasi otomatis saat koneksi pulih dengan idempotensi 2-fase." />
            <FeatureCard icon="⛓️" title="Hash Chain SHA-256" desc="Setiap entri ledger dikunci dengan rantai hash kriptografis. Data tidak bisa diubah tanpa terdeteksi." />
            <FeatureCard icon="📊" title="Akuntansi SAK EP Otomatis" desc="Jurnal ganda (debit/kredit) di-generate otomatis oleh database trigger saat tutup buku harian." />
            <FeatureCard icon="🏦" title="Batas Brankas Rp50 Juta" desc="Sistem memblokir total terminal POS jika kas tunai melebihi batas audit BPKP. Hanya bisa dibuka dengan bukti setor bank." />
            <FeatureCard icon="🌐" title="Multi-Tenant RLS" desc="189 gerai terisolasi secara logis dalam satu database via PostgreSQL Row-Level Security." />
            <FeatureCard icon="💳" title="Pembayaran QRIS" desc="Integrasi Xendit untuk pembayaran non-tunai. Webhook anti-duplikasi dengan ON CONFLICT DO NOTHING." />
            <FeatureCard icon="🤖" title="GEO/SEO untuk AI Search" desc="189 halaman statis dengan JSON-LD schema.org agar terindeks oleh Gemini, Perplexity, dan SearchGPT." />
          </div>
        </Section>

        {/* Konteks Lokal Pamekasan */}
        <Section title="Konteks Lokal: Kabupaten Pamekasan">
          <p>
            Pamekasan memiliki kontur wilayah yang sangat kontras. Pesisir selatan (Pademawu,
            Larangan, Tlanakan) relatif datar dengan sinyal 4G baik. Dataran tinggi utara
            (Pakong, Pegantenan, Batumarmar) didominasi perbukitan terjal dengan banyak blank spot.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4" style={{ border: '3px solid var(--border-primary)' }}>
              <h4 className="text-sm font-black uppercase">Tembakau KITMAS</h4>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                Pamekasan adalah episentrum tembakau rajangan berkualitas tinggi di Madura.
                Koperasi Induk Tembakau Madura Sejahtera (KITMAS) di Kecamatan Larangan
                melindungi petani dari eksploitasi tengkulak melalui standarisasi mutu digital.
              </p>
            </div>
            <div className="p-4" style={{ border: '3px solid var(--border-primary)' }}>
              <h4 className="text-sm font-black uppercase">Garam Geomembran Pademawu</h4>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                Desa Majungan, Kecamatan Pademawu, adalah sentra produksi garam rakyat dengan
                teknologi geomembran (Perpres 126/2022). KDKMP bertindak sebagai off-taker
                langsung dari nelayan garam.
              </p>
            </div>
          </div>
        </Section>

        {/* Cakupan Wilayah */}
        <Section title="Cakupan 13 Kecamatan">
          <div className="flex flex-wrap gap-2">
            {['Pamekasan', 'Tlanakan', 'Pademawu', 'Galis', 'Larangan', 'Proppo', 'Palengaan', 'Pegantenan', 'Kadur', 'Pakong', 'Waru', 'Batumarmar', 'Pasean'].map((kec) => (
              <span
                key={kec}
                className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider"
                style={{ border: '2px solid var(--border-primary)' }}
              >
                {kec}
              </span>
            ))}
          </div>
          <p className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
            189 gerai tersebar merata di seluruh kecamatan. Masing-masing gerai memiliki
            halaman pSEO statis dengan JSON-LD structured data untuk AI search engines.
          </p>
        </Section>

        {/* Kepatuhan Regulasi */}
        <Section title="Kepatuhan Regulasi">
          <div className="space-y-3">
            <RegulationItem code="Inpres 17/2025" desc="Percepatan Pembangunan Fisik Gerai KDKMP — mandat utama program" />
            <RegulationItem code="PP 60/2008" desc="Sistem Pengendalian Intern Pemerintah (SPIP) — audit trail otomatis" />
            <RegulationItem code="SAK EP 2025" desc="Standar Akuntansi Keuangan Entitas Privat — jurnal ganda otomatis" />
            <RegulationItem code="PP 11/2021 Pasal 40(2)" desc="BUMDes — PADes minimal 20% dari SHU bersih tahunan" />
            <RegulationItem code="UU 28/2014" desc="Hak Cipta — kepemilikan IP mutlak pada PT Memory Groups Sejahtera" />
            <RegulationItem code="NIST SP 800-132" desc="PBKDF2 600.000 iterasi — standar derivasi kunci enkripsi" />
          </div>
        </Section>

        {/* Persona Pengguna */}
        <Section title="Persona Pengguna">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PersonaCard
              name="Bapak Sukri"
              role="Admin KDKMP (Operator Kasir)"
              age="45 tahun"
              literacy="Menengah"
              needs="POS sederhana, laporan instan, pencatatan otomatis"
            />
            <PersonaCard
              name="Ibu Sumiati"
              role="Anggota Petani"
              age="38 tahun"
              literacy="Rendah"
              needs="Kredit saprotan, harga adil, QR keanggotaan offline"
            />
            <PersonaCard
              name="Ibu Diana"
              role="Eksekutif PT Agrinas"
              age="40 tahun"
              literacy="Tinggi"
              needs="Dasbor nasional, deteksi penyimpangan, pelacakan armada"
            />
          </div>
        </Section>

        {/* Tech Stack */}
        <Section title="Tech Stack">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <TechItem name="Next.js 15" desc="Framework" />
            <TechItem name="React 19" desc="UI Library" />
            <TechItem name="TypeScript 5.9" desc="Language" />
            <TechItem name="Tailwind CSS 4" desc="Styling" />
            <TechItem name="NeonDB" desc="PostgreSQL Serverless" />
            <TechItem name="Upstash Redis" desc="Rate Limit & Cache" />
            <TechItem name="Dexie.js" desc="IndexedDB Encrypted" />
            <TechItem name="Zustand" desc="State Management" />
            <TechItem name="Xendit" desc="Payment Gateway" />
            <TechItem name="Vercel" desc="Hosting (Hobby)" />
            <TechItem name="Web Crypto API" desc="AES-GCM 256-bit" />
            <TechItem name="next-themes" desc="Dark/Light Mode" />
          </div>
        </Section>

        {/* Pihak Terkait */}
        <Section title="Pihak Terkait">
          <div className="space-y-3">
            <StakeholderItem name="PT Memory Groups Sejahtera" role="Pemberi Lisensi — Pengembang & Pemilik IP JASASAJA" />
            <StakeholderItem name="PT Agrinas Pangan Nusantara (Persero)" role="Penerima Lisensi — BUMN pengelola KDKMP nasional" />
            <StakeholderItem name="Danantara" role="Super Holding — Portofolio induk PT Agrinas" />
            <StakeholderItem name="Kementerian Koperasi RI" role="Regulator — Pengawasan tata kelola koperasi" />
            <StakeholderItem name="BPK & BPKP" role="Auditor — Pemeriksaan keuangan dan kepatuhan SPIP" />
            <StakeholderItem name="Kodim Pamekasan" role="Mitra Pembangunan — Konstruksi fisik gerai" />
          </div>
        </Section>

        {/* Model Bisnis */}
        <Section title="Model Bisnis (SaaS)">
          <div className="p-5" style={{ border: '3px solid var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
            <p className="text-sm leading-relaxed">
              JASASAJA beroperasi dengan model Software-as-a-Service (SaaS) berlangganan per gerai.
              Lisensi bersifat non-eksklusif, non-transferabel, dan terisolasi per unit KDKMP.
              Seluruh hak kekayaan intelektual — termasuk source code, database schema, algoritma,
              dan dokumentasi — adalah milik mutlak PT Memory Groups Sejahtera sesuai UU 28/2014
              tentang Hak Cipta.
            </p>
          </div>
        </Section>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8" style={{ borderTop: '4px solid var(--border-primary)' }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>
              © 2025 JASASAJA — PT Memory Groups Sejahtera
            </p>
            <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-faint)' }}>
              Lisensi SaaS untuk PT Agrinas Pangan Nusantara (Persero)
            </p>
          </div>
          <a
            href="/"
            className="text-xs font-mono font-bold px-4 py-2 uppercase"
            style={{ minHeight: '48px', display: 'flex', alignItems: 'center', border: '2px solid var(--border-primary)', color: 'var(--text-primary)' }}
          >
            ← Beranda
          </a>
        </div>
      </footer>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// SUB-KOMPONEN
// ═══════════════════════════════════════════════════════════════

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-black uppercase tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h2>
      <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {children}
      </div>
    </section>
  );
}

function ProblemCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4" style={{ border: '3px solid var(--accent-danger)', backgroundColor: 'var(--bg-secondary)' }}>
      <h4 className="text-sm font-black" style={{ color: 'var(--accent-danger)' }}>✗ {title}</h4>
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="p-4" style={{ border: '2px solid var(--border-primary)' }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <h4 className="text-sm font-black">{title}</h4>
      </div>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
    </div>
  );
}

function RegulationItem({ code, desc }: { code: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid var(--border-muted)' }}>
      <span className="text-xs font-mono font-bold px-2 py-1 shrink-0" style={{ backgroundColor: 'var(--bg-invert)', color: 'var(--text-invert)' }}>
        {code}
      </span>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{desc}</p>
    </div>
  );
}

function PersonaCard({ name, role, age, literacy, needs }: { name: string; role: string; age: string; literacy: string; needs: string }) {
  return (
    <div className="p-4" style={{ border: '3px solid var(--border-primary)' }}>
      <h4 className="text-sm font-black">{name}</h4>
      <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-faint)' }}>{role}</p>
      <div className="mt-3 space-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
        <p><strong>Usia:</strong> {age}</p>
        <p><strong>Literasi Digital:</strong> {literacy}</p>
        <p><strong>Kebutuhan:</strong> {needs}</p>
      </div>
    </div>
  );
}

function TechItem({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="p-3 text-center" style={{ border: '2px solid var(--border-secondary)' }}>
      <p className="text-xs font-black">{name}</p>
      <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-faint)' }}>{desc}</p>
    </div>
  );
}

function StakeholderItem({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid var(--border-muted)' }}>
      <span className="text-sm font-black shrink-0" style={{ color: 'var(--text-primary)' }}>{name}</span>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{role}</p>
    </div>
  );
}

/**
 * ============================================================================
 * HALAMAN UTAMA — JASASAJA KDKMP (Dark Mode Brutalist)
 * ============================================================================
 * Static Generation (SSG) — Zero runtime cost
 * Branding: JASASAJA — Platform KDKMP PT Agrinas Pangan Nusantara
 * Desain: Dark brutalist (#0A0A0A background, #FFFFFF text)
 * ============================================================================
 */

import { Metadata } from 'next';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'JASASAJA — Platform Digital KDKMP Koperasi Desa Merah Putih',
  description:
    'Platform SaaS manajemen 189 gerai Koperasi Desa dan Kelurahan Merah Putih (KDKMP) Kabupaten Pamekasan. POS luring-pertama, akuntansi SAK EP otomatis, audit trail kriptografis SHA-256. Kepatuhan Inpres 17/2025.',
  keywords: [
    'JASASAJA',
    'KDKMP',
    'Koperasi Desa Merah Putih',
    'PT Agrinas Pangan Nusantara',
    'SAK EP',
    'Pamekasan',
    'Inpres 17/2025',
  ],
  openGraph: {
    title: 'JASASAJA — Platform Digital KDKMP',
    description:
      'Sistem manajemen koperasi desa terintegrasi untuk 189 gerai di Kabupaten Pamekasan, Madura.',
    type: 'website',
    siteName: 'JASASAJA',
  },
};

const STATS = {
  totalGerai: 189,
  kecamatan: 13,
  region: 'Kabupaten Pamekasan, Madura',
  fitur: [
    'POS Luring-Pertama (Offline-First)',
    'Akuntansi Ganda Otomatis SAK EP',
    'Rantai Hash Kriptografis SHA-256',
    'Row-Level Security per Gerai',
    'Idempotensi Dua-Fase (Blank Spot Tolerant)',
    'Kalkulator PADes Transparan (Inpres 17/2025)',
  ],
} as const;

const KECAMATAN = [
  'Pamekasan', 'Tlanakan', 'Pademawu', 'Galis', 'Larangan',
  'Proppo', 'Palengaan', 'Pegantenan', 'Kadur', 'Pakong',
  'Waru', 'Batumarmar', 'Pasean',
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#0A0A0A', color: '#FFFFFF' }}>
      {/* Hero */}
      <header style={{ borderBottom: '4px solid #FFFFFF' }}>
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <span
            className="inline-block text-[10px] font-mono uppercase tracking-widest px-3 py-1 mb-6"
            style={{ backgroundColor: '#FFFFFF', color: '#0A0A0A' }}
          >
            PT Agrinas Pangan Nusantara &bull; Inpres 17/2025
          </span>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none mb-4">
            JASASAJA
          </h1>
          <p className="text-lg md:text-xl max-w-2xl leading-relaxed" style={{ color: '#A0A0A0' }}>
            Platform digital manajemen{' '}
            <strong style={{ color: '#FFFFFF' }}>Koperasi Desa dan Kelurahan Merah Putih (KDKMP)</strong>{' '}
            untuk {STATS.totalGerai} gerai percontohan di {STATS.region}.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-wider text-sm"
              style={{
                minHeight: '48px',
                padding: '14px 28px',
                backgroundColor: '#FFFFFF',
                color: '#0A0A0A',
                border: '3px solid #FFFFFF',
              }}
            >
              Masuk Dashboard Kasir →
            </a>
            <a
              href="/kalkulator-shu"
              className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-wider text-sm"
              style={{
                minHeight: '48px',
                padding: '14px 28px',
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                border: '3px solid #FFFFFF',
              }}
            >
              Kalkulator SHU &amp; PADes →
            </a>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section style={{ borderBottom: '4px solid #FFFFFF' }}>
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x-4 divide-white/20">
          <div className="text-center py-6 md:py-0">
            <p className="text-4xl md:text-5xl font-black">{STATS.totalGerai}</p>
            <p className="text-xs font-mono uppercase tracking-widest mt-1" style={{ color: '#6B6B6B' }}>
              Gerai Aktif
            </p>
          </div>
          <div className="text-center py-6 md:py-0">
            <p className="text-4xl md:text-5xl font-black">{STATS.kecamatan}</p>
            <p className="text-xs font-mono uppercase tracking-widest mt-1" style={{ color: '#6B6B6B' }}>
              Kecamatan
            </p>
          </div>
          <div className="text-center py-6 md:py-0">
            <p className="text-4xl md:text-5xl font-black">Rp0</p>
            <p className="text-xs font-mono uppercase tracking-widest mt-1" style={{ color: '#6B6B6B' }}>
              Biaya Infrastruktur/Bulan
            </p>
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section style={{ borderBottom: '4px solid #FFFFFF' }}>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h2 className="text-xl font-black uppercase tracking-tight mb-6">
            Arsitektur Enterprise
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STATS.fitur.map((f) => (
              <div
                key={f}
                className="flex items-start gap-3 p-4"
                style={{ border: '2px solid #333333' }}
              >
                <span className="text-green-400 font-black text-lg leading-none">✓</span>
                <span className="text-sm font-medium" style={{ color: '#E0E0E0' }}>{f}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs" style={{ color: '#555555' }}>
            Standar: SAK EP (Entitas Privat) &bull; Kepatuhan: BPK &amp; BPKP &bull; Batas Brankas: Rp50.000.000
          </p>
        </div>
      </section>

      {/* Cakupan Wilayah */}
      <section style={{ borderBottom: '4px solid #FFFFFF' }}>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h2 className="text-xl font-black uppercase tracking-tight mb-6">
            Cakupan Wilayah Pamekasan
          </h2>
          <div className="flex flex-wrap gap-2">
            {KECAMATAN.map((kec) => (
              <span
                key={kec}
                className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider"
                style={{ border: '2px solid #444444', color: '#CCCCCC' }}
              >
                {kec}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs" style={{ color: '#555555' }}>
            Seluruh 13 kecamatan tercakup. Arsitektur offline-first untuk wilayah blank spot Pamekasan Utara.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs font-mono" style={{ color: '#555555' }}>
            © 2025 JASASAJA — PT Memory Groups Sejahtera
          </p>
          <p className="text-xs font-mono" style={{ color: '#555555' }}>
            Lisensi SaaS untuk PT Agrinas Pangan Nusantara (Persero)
          </p>
        </div>
      </footer>
    </div>
  );
}

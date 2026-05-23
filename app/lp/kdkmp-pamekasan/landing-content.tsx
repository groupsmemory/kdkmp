'use client';

/**
 * Landing page content — client component untuk Meta Pixel tracking
 */

import { useCallback } from 'react';
import { trackMetaEvent } from '@/components/MetaPixel';
import ThemeToggle from '@/components/ThemeToggle';

export default function LandingContent() {
  const handleCTA = useCallback((ctaType: string) => {
    trackMetaEvent({
      eventName: 'Lead',
      contentName: `CTA: ${ctaType} — LP KDKMP Pamekasan`,
    });
  }, []);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Hero */}
      <header style={{ borderBottom: '6px solid var(--border-primary)' }}>
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
          <div className="flex justify-between items-start mb-8">
            <span
              className="inline-block text-xs font-mono uppercase tracking-widest px-3 py-1.5"
              style={{ backgroundColor: '#00F2FE', color: '#0A0A0A' }}
            >
              Inpres 17/2025 • PT Agrinas Pangan Nusantara
            </span>
            <ThemeToggle />
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
            189 Koperasi Desa
            <br />
            <span style={{ color: '#00F2FE' }}>Satu Platform</span>
          </h1>

          <p className="text-lg md:text-xl max-w-xl mt-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Digitalisasi penuh operasional KDKMP Kabupaten Pamekasan.
            POS offline-first, akuntansi SAK EP otomatis, audit trail kriptografis SHA-256.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <a
              href="/dashboard"
              onClick={() => handleCTA('Masuk Dashboard')}
              className="inline-flex items-center justify-center font-black uppercase tracking-wider text-sm"
              style={{
                minHeight: '56px',
                padding: '16px 32px',
                backgroundColor: '#00F2FE',
                color: '#0A0A0A',
                border: '4px solid #00F2FE',
              }}
            >
              Masuk Dashboard →
            </a>
            <a
              href="/kalkulator-shu"
              onClick={() => handleCTA('Kalkulator SHU')}
              className="inline-flex items-center justify-center font-black uppercase tracking-wider text-sm"
              style={{
                minHeight: '56px',
                padding: '16px 32px',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                border: '4px solid var(--border-primary)',
              }}
            >
              Hitung SHU & PADes →
            </a>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="py-12" style={{ borderBottom: '4px solid var(--border-primary)' }}>
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <Stat value="189" label="Gerai Aktif" />
          <Stat value="13" label="Kecamatan" />
          <Stat value="Rp0" label="Biaya Infra/Bulan" />
          <Stat value="100%" label="Offline-Ready" />
        </div>
      </section>

      {/* Pain Points → Solutions */}
      <section className="py-12" style={{ borderBottom: '4px solid var(--border-primary)' }}>
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-8">
            Masalah yang Kami Selesaikan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PainPoint
              problem="Pencatatan manual rawan manipulasi"
              solution="Rantai hash SHA-256 — data tidak bisa diubah tanpa terdeteksi"
            />
            <PainPoint
              problem="Blank spot internet di desa"
              solution="POS offline-first — transaksi tetap jalan tanpa sinyal"
            />
            <PainPoint
              problem="Laporan keuangan tidak standar"
              solution="Jurnal ganda otomatis SAK EP — siap audit BPK/BPKP"
            />
            <PainPoint
              problem="PADes tidak transparan"
              solution="Kalkulasi otomatis 20% SHU — sesuai Inpres 17/2025"
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12" style={{ borderBottom: '4px solid var(--border-primary)' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-4">
            Kepatuhan Regulasi
          </h2>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['Inpres 17/2025', 'SAK EP', 'PP 60/2008 (SPIP)', 'Audit BPKP', 'PP 11/2021'].map((reg) => (
              <span
                key={reg}
                className="px-4 py-2 text-xs font-mono font-bold uppercase"
                style={{ border: '3px solid var(--border-primary)' }}
              >
                {reg}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
            Siap Digitalisasi?
          </h2>
          <p className="text-lg mt-4" style={{ color: 'var(--text-muted)' }}>
            Zero biaya infrastruktur. Langsung operasional.
          </p>
          <a
            href="/dashboard"
            onClick={() => handleCTA('Final CTA')}
            className="inline-flex items-center justify-center font-black uppercase tracking-wider text-lg mt-8"
            style={{
              minHeight: '56px',
              padding: '16px 40px',
              backgroundColor: '#00F2FE',
              color: '#0A0A0A',
              border: '4px solid #00F2FE',
            }}
          >
            Mulai Sekarang →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6" style={{ borderTop: '2px solid var(--border-muted)' }}>
        <p className="text-center text-xs font-mono" style={{ color: 'var(--text-faint)' }}>
          © 2025 JASASAJA — PT Memory Groups Sejahtera • Lisensi SaaS untuk PT Agrinas Pangan Nusantara (Persero)
        </p>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl md:text-4xl font-black">{value}</p>
      <p className="text-xs font-mono uppercase tracking-widest mt-1" style={{ color: 'var(--text-faint)' }}>
        {label}
      </p>
    </div>
  );
}

function PainPoint({ problem, solution }: { problem: string; solution: string }) {
  return (
    <div className="p-5" style={{ border: '3px solid var(--border-primary)' }}>
      <p className="text-sm font-bold" style={{ color: 'var(--accent-danger)' }}>
        ✗ {problem}
      </p>
      <p className="text-sm mt-2 font-bold" style={{ color: 'var(--accent-success)' }}>
        ✓ {solution}
      </p>
    </div>
  );
}

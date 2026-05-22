'use client';

/**
 * ============================================================================
 * HALAMAN LAPORAN KEUANGAN — Landing Page
 * ============================================================================
 * Menu navigasi ke sub-laporan: Jurnal Umum, Neraca, Laba Rugi
 * ============================================================================
 */

import ThemeToggle from '@/components/ThemeToggle';

export default function LaporanPage() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <header className="px-4 py-4 sm:px-6" style={{ borderBottom: '4px solid var(--border-primary)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight">Laporan Keuangan</h1>
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              KDKMP JASASAJA • Standar SAK EP
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href="/dashboard"
              className="text-xs font-mono font-bold px-3 py-2 uppercase"
              style={{ minHeight: '48px', display: 'flex', alignItems: 'center', border: '2px solid var(--border-secondary)', color: 'var(--text-muted)' }}
            >
              ← Dashboard
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ReportCard
            href="/laporan/jurnal-umum"
            title="Jurnal Umum"
            description="Seluruh entri debit/kredit berantai hash SHA-256"
            icon="📒"
          />
          <ReportCard
            href="/laporan/neraca"
            title="Neraca"
            description="Posisi keuangan: Aset, Liabilitas, Ekuitas"
            icon="⚖️"
          />
          <ReportCard
            href="/laporan/laba-rugi"
            title="Laba Rugi"
            description="Pendapatan dikurangi beban operasional"
            icon="📈"
          />
        </div>

        <div className="mt-8 p-4" style={{ border: '2px solid var(--border-muted)', backgroundColor: 'var(--bg-secondary)' }}>
          <p className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>
            Semua laporan di-generate dari ledger_entries yang bersifat append-only dan dilindungi rantai hash kriptografis SHA-256.
            Data tidak dapat dimanipulasi tanpa terdeteksi oleh mekanisme audit BPKP.
          </p>
        </div>
      </div>

      <footer className="px-4 py-3" style={{ borderTop: '2px solid var(--border-muted)' }}>
        <p className="text-center text-xs font-mono" style={{ color: 'var(--text-faint)' }}>
          Kepatuhan: SAK EP • Inpres 17/2025 • Audit BPKP • Imutabilitas Hash Chain
        </p>
      </footer>
    </div>
  );
}

function ReportCard({ href, title, description, icon }: { href: string; title: string; description: string; icon: string }) {
  return (
    <a href={href}>
      <div
        className="p-5 h-full transition-all cursor-pointer"
        style={{ border: '3px solid var(--border-primary)', backgroundColor: 'var(--bg-card)' }}
      >
        <div className="flex items-start gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="text-sm font-black uppercase">{title}</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{description}</p>
          </div>
        </div>
      </div>
    </a>
  );
}

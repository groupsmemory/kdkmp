'use client';

/**
 * ============================================================================
 * DASHBOARD KASIR KDKMP — Halaman Utama Operator Gerai
 * ============================================================================
 * Persona: Bapak Sukri (45 tahun, Sekretaris Desa, literasi digital menengah)
 * Desain: Brutalistik, tombol besar 48dp, font jelas, navigasi sederhana
 * Fitur:
 *   - Ringkasan kas harian (dengan indikator batas Rp50jt)
 *   - Status sinkronisasi offline
 *   - Menu navigasi POS, Tutup Buku, Laporan
 *   - Indikator koneksi (online/offline)
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { useCashStore } from '@/components/POSLockout';
import ThemeToggle from '@/components/ThemeToggle';

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const CASH_LIMIT = 50_000_000;

export default function DashboardKasir() {
  const { cashOnHand, isLocked } = useCashStore();
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);

    const onlineHandler = () => setIsOnline(true);
    const offlineHandler = () => setIsOnline(false);
    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    }, 1000);

    return () => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
      clearInterval(timer);
    };
  }, []);

  const cashPercent = Math.min((cashOnHand / CASH_LIMIT) * 100, 100);
  const cashWarning = cashOnHand > CASH_LIMIT * 0.8;
  const cashDanger = cashOnHand > CASH_LIMIT;

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <p className="font-mono text-sm">Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <header className="px-4 py-4 sm:px-6" style={{ borderBottom: '3px solid var(--border-primary)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight">
              Dashboard Kasir
            </h1>
            <p className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>
              KDKMP JASASAJA — Gerai Pamekasan
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-mono">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isOnline ? 'var(--accent-success)' : 'var(--accent-danger)' }}
              />
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <ThemeToggle />
            <a
              href="/"
              className="text-xs font-mono font-bold px-3 py-2 uppercase"
              style={{
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                border: '2px solid var(--border-secondary)',
                color: 'var(--text-muted)',
              }}
            >
              ← Beranda
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Waktu */}
        <p className="text-xs font-mono text-center" style={{ color: 'var(--text-faint)' }}>
          {currentTime}
        </p>

        {/* Ringkasan Kas */}
        <div className="p-5 sm:p-6" style={{ border: '3px solid var(--border-primary)', backgroundColor: 'var(--bg-card)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Saldo Kas Brankas
            </h2>
            <span
              className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5"
              style={{
                backgroundColor: cashDanger ? '#7F1D1D' : cashWarning ? '#78350F' : '#14532D',
                color: cashDanger ? '#FCA5A5' : cashWarning ? '#FDE68A' : '#86EFAC',
              }}
            >
              {cashDanger ? 'MELEBIHI BATAS' : cashWarning ? 'MENDEKATI BATAS' : 'AMAN'}
            </span>
          </div>

          <p
            className="text-3xl sm:text-4xl font-black font-mono"
            style={{ color: cashDanger ? 'var(--accent-danger)' : cashWarning ? 'var(--accent-warning)' : 'var(--text-primary)' }}
          >
            {formatRupiah(cashOnHand)}
          </p>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] font-mono mb-1" style={{ color: 'var(--text-faint)' }}>
              <span>Rp0</span>
              <span>Batas: {formatRupiah(CASH_LIMIT)}</span>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${cashPercent}%`,
                  backgroundColor: cashDanger ? 'var(--accent-danger)' : cashWarning ? 'var(--accent-warning)' : 'var(--accent-success)',
                }}
              />
            </div>
          </div>

          {cashWarning && !cashDanger && (
            <p className="mt-3 text-xs font-mono" style={{ color: 'var(--accent-warning)' }}>
              ⚠ Segera lakukan penyetoran ke bank. Sisa kapasitas: {formatRupiah(CASH_LIMIT - cashOnHand)}
            </p>
          )}
        </div>

        {/* Menu Navigasi Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MenuCard href="/pos" title="Transaksi POS" description="Input penjualan sembako harian" icon="🛒" disabled={isLocked} />
          <MenuCard href="/pos/tutup-buku" title="Tutup Buku Harian" description="Rekonsiliasi kas & generate jurnal SAK EP" icon="📋" disabled={isLocked} />
          <MenuCard href="/laporan" title="Laporan Keuangan" description="Neraca, laba rugi, jurnal umum" icon="📊" />
          <MenuCard href="/kalkulator-shu" title="Kalkulator SHU & PADes" description="Hitung kontribusi desa (Inpres 17/2025)" icon="🧮" />
          <MenuCard href="/anggota" title="Data Anggota" description="Kelola petani & kredit saprotan" icon="👥" disabled comingSoon />
          <MenuCard href="/hasil-bumi" title="Pencatatan Hasil Bumi" description="Tembakau KITMAS & garam Pademawu" icon="🌾" disabled comingSoon />
        </div>

        {/* Info Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatusCard label="Sinkronisasi" value={isOnline ? 'Aktif' : 'Tertunda'} color={isOnline ? 'var(--accent-success)' : 'var(--accent-warning)'} />
          <StatusCard label="Enkripsi Lokal" value="AES-256 Aktif" color="var(--accent-info)" />
          <StatusCard label="Rate Limit" value="20 req/menit" color="#8B5CF6" />
        </div>

        {/* Footer Info */}
        <div className="text-center pt-4" style={{ borderTop: '1px solid var(--border-muted)' }}>
          <p className="text-[10px] font-mono" style={{ color: 'var(--text-faint)' }}>
            KDKMP JASASAJA v1.0 &bull; Kepatuhan: SAK EP &bull; Inpres 17/2025 &bull; Audit BPKP
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════

function MenuCard({
  href, title, description, icon, disabled = false, comingSoon = false,
}: {
  href: string; title: string; description: string; icon: string; disabled?: boolean; comingSoon?: boolean;
}) {
  const content = (
    <div
      className={`p-5 h-full transition-all ${disabled ? 'opacity-50' : ''}`}
      style={{
        border: '2px solid var(--border-secondary)',
        backgroundColor: 'var(--bg-card)',
        minHeight: '48px',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold">{title}</h3>
            {comingSoon && (
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-faint)' }}>
                Segera
              </span>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{description}</p>
        </div>
      </div>
      {disabled && !comingSoon && (
        <p className="text-[10px] font-mono mt-2" style={{ color: 'var(--accent-danger)' }}>
          🔒 Diblokir — Kas melebihi batas Rp50 juta
        </p>
      )}
    </div>
  );

  if (disabled) return content;
  return <a href={href}>{content}</a>;
}

function StatusCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-3" style={{ border: '1px solid var(--border-muted)', backgroundColor: 'var(--bg-secondary)' }}>
      <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
        {label}
      </p>
      <p className="text-xs font-bold mt-0.5" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

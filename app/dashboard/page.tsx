'use client';

/**
 * ============================================================================
 * DASHBOARD KASIR KDKMP — Halaman Utama Operator Gerai
 * ============================================================================
 * Persona: Bapak Sukri (45 tahun, Sekretaris Desa, literasi digital menengah)
 * Desain: Dark mode, tombol besar 48dp, font jelas, navigasi sederhana
 * Fitur:
 *   - Ringkasan kas harian (dengan indikator batas Rp50jt)
 *   - Status sinkronisasi offline
 *   - Menu navigasi POS, Tutup Buku, Laporan
 *   - Indikator koneksi (online/offline)
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { useCashStore } from '@/components/POSLockout';

// Format Rupiah
function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Batas kas brankas BPKP
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

    // Update waktu setiap detik
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0A', color: '#FFFFFF' }}>
        <p className="font-mono text-sm">Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#0A0A0A', color: '#FFFFFF' }}>
      {/* Header */}
      <header className="px-4 py-4 sm:px-6" style={{ borderBottom: '2px solid #222222' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight">
              Dashboard Kasir
            </h1>
            <p className="text-xs font-mono" style={{ color: '#666666' }}>
              KDKMP JASASAJA — Gerai Pamekasan
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Status Online/Offline */}
            <span className="flex items-center gap-1.5 text-xs font-mono">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isOnline ? '#10B981' : '#EF4444' }}
              />
              {isOnline ? 'Online' : 'Offline'}
            </span>
            {/* Kembali */}
            <a
              href="/"
              className="text-xs font-mono px-3 py-1.5"
              style={{ border: '1px solid #333333', color: '#999999' }}
            >
              ← Beranda
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Waktu */}
        <p className="text-xs font-mono text-center" style={{ color: '#555555' }}>
          {currentTime}
        </p>

        {/* Ringkasan Kas */}
        <div className="p-5 sm:p-6" style={{ border: '3px solid #222222', backgroundColor: '#111111' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: '#999999' }}>
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
            style={{ color: cashDanger ? '#EF4444' : cashWarning ? '#F59E0B' : '#FFFFFF' }}
          >
            {formatRupiah(cashOnHand)}
          </p>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] font-mono mb-1" style={{ color: '#666666' }}>
              <span>Rp0</span>
              <span>Batas: {formatRupiah(CASH_LIMIT)}</span>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: '#222222' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${cashPercent}%`,
                  backgroundColor: cashDanger ? '#EF4444' : cashWarning ? '#F59E0B' : '#10B981',
                }}
              />
            </div>
          </div>

          {cashWarning && !cashDanger && (
            <p className="mt-3 text-xs font-mono" style={{ color: '#F59E0B' }}>
              ⚠ Segera lakukan penyetoran ke bank. Sisa kapasitas: {formatRupiah(CASH_LIMIT - cashOnHand)}
            </p>
          )}
        </div>

        {/* Menu Navigasi Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MenuCard
            href="/pos"
            title="Transaksi POS"
            description="Input penjualan sembako harian"
            icon="🛒"
            disabled={isLocked}
          />
          <MenuCard
            href="/pos/tutup-buku"
            title="Tutup Buku Harian"
            description="Rekonsiliasi kas & generate jurnal SAK EP"
            icon="📋"
            disabled={isLocked}
          />
          <MenuCard
            href="/laporan"
            title="Laporan Keuangan"
            description="Neraca, laba rugi, jurnal umum"
            icon="📊"
          />
          <MenuCard
            href="/kalkulator-shu"
            title="Kalkulator SHU & PADes"
            description="Hitung kontribusi desa (Inpres 17/2025)"
            icon="🧮"
          />
          <MenuCard
            href="/anggota"
            title="Data Anggota"
            description="Kelola petani & kredit saprotan"
            icon="👥"
            disabled
            comingSoon
          />
          <MenuCard
            href="/hasil-bumi"
            title="Pencatatan Hasil Bumi"
            description="Tembakau KITMAS & garam Pademawu"
            icon="🌾"
            disabled
            comingSoon
          />
        </div>

        {/* Info Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatusCard
            label="Sinkronisasi"
            value={isOnline ? 'Aktif' : 'Tertunda'}
            color={isOnline ? '#10B981' : '#F59E0B'}
          />
          <StatusCard
            label="Enkripsi Lokal"
            value="AES-256 Aktif"
            color="#6366F1"
          />
          <StatusCard
            label="Rate Limit"
            value="20 req/menit"
            color="#8B5CF6"
          />
        </div>

        {/* Footer Info */}
        <div className="text-center pt-4" style={{ borderTop: '1px solid #222222' }}>
          <p className="text-[10px] font-mono" style={{ color: '#444444' }}>
            KDKMP JASASAJA v1.0 &bull; Kepatuhan: SAK EP &bull; Inpres 17/2025 &bull; Audit BPKP
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-KOMPONEN
// ═══════════════════════════════════════════════════════════════

function MenuCard({
  href,
  title,
  description,
  icon,
  disabled = false,
  comingSoon = false,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
  disabled?: boolean;
  comingSoon?: boolean;
}) {
  const content = (
    <div
      className={`p-5 h-full transition-all ${disabled ? 'opacity-50' : 'hover:border-white/30'}`}
      style={{
        border: '2px solid #222222',
        backgroundColor: '#111111',
        minHeight: '48px',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">{title}</h3>
            {comingSoon && (
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5" style={{ backgroundColor: '#333333', color: '#888888' }}>
                Segera
              </span>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: '#777777' }}>{description}</p>
        </div>
      </div>
      {disabled && !comingSoon && (
        <p className="text-[10px] font-mono mt-2" style={{ color: '#EF4444' }}>
          🔒 Diblokir — Kas melebihi batas Rp50 juta
        </p>
      )}
    </div>
  );

  if (disabled) return content;

  return <a href={href}>{content}</a>;
}

function StatusCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="p-3" style={{ border: '1px solid #222222', backgroundColor: '#0D0D0D' }}>
      <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#555555' }}>
        {label}
      </p>
      <p className="text-xs font-bold mt-0.5" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

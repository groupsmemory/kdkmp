'use client';

/**
 * ============================================================================
 * HALAMAN TUTUP BUKU HARIAN — Rekonsiliasi Kas & Jurnal SAK EP
 * ============================================================================
 * Persona: Bapak Sukri (45 tahun, operator kasir gerai desa)
 * Fungsi:
 *   - Agregasi total kas dari transaksi hari ini (IndexedDB)
 *   - Input kas fisik aktual untuk rekonsiliasi
 *   - Kirim daily closing ke server → trigger SAK EP otomatis
 *   - Reset kas Zustand setelah tutup buku berhasil
 *
 * Kepatuhan:
 *   - SAK EP — Jurnal ganda otomatis (Debit Kas, Kredit Pendapatan)
 *   - PP 60/2008 (SPIP) — Batas brankas Rp50.000.000
 *   - Inpres 17/2025 — Transparansi keuangan desa
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { useCashStore } from '@/components/POSLockout';
import ThemeToggle from '@/components/ThemeToggle';
import {
  getOfflineTransactions,
  type OfflineTransaction,
} from '@/lib/dexieStore';

// ═══════════════════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════════════════

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function parseInputToNumber(raw: string): number {
  const cleaned = raw.replace(/[^\d]/g, '');
  return cleaned === '' ? 0 : parseInt(cleaned, 10);
}

function formatInputDisplay(value: number): string {
  if (value === 0) return '';
  return new Intl.NumberFormat('id-ID').format(value);
}

// ═══════════════════════════════════════════════════════════════
// TIPE
// ═══════════════════════════════════════════════════════════════

interface DailySummary {
  totalCash: number;
  totalQris: number;
  totalAll: number;
  transactionCount: number;
  items: Array<{ name: string; qty: number; total: number }>;
}

type ClosingStatus = 'idle' | 'submitting' | 'success' | 'error';

// ═══════════════════════════════════════════════════════════════
// KOMPONEN UTAMA
// ═══════════════════════════════════════════════════════════════

export default function TutupBukuPage() {
  const { cashOnHand, resetCash } = useCashStore();
  const [passphrase, setPassphrase] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [kasFisik, setKasFisik] = useState(0);
  const [kasFisikDisplay, setKasFisikDisplay] = useState('');
  const [notes, setNotes] = useState('');
  const [closingStatus, setClosingStatus] = useState<ClosingStatus>('idle');
  const [closingResult, setClosingResult] = useState<{ closingId: string; closedAt: string } | null>(null);

  // ─── Login passphrase (sama dengan POS) ────────────────────
  const handleLogin = useCallback(() => {
    if (passphrase.length >= 8) {
      setIsAuthenticated(true);
    }
  }, [passphrase]);

  // ─── Load transaksi hari ini dari IndexedDB ────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    getOfflineTransactions(passphrase).then((transactions) => {
      const todayTxs = transactions.filter((tx) => tx.createdAt >= todayStart);

      const totalCash = todayTxs
        .filter((tx) => tx.paymentMethod === 'CASH')
        .reduce((sum, tx) => sum + tx.amount, 0);

      const totalQris = todayTxs
        .filter((tx) => tx.paymentMethod === 'QRIS')
        .reduce((sum, tx) => sum + tx.amount, 0);

      // Agregasi item
      const itemMap = new Map<string, { qty: number; total: number }>();
      for (const tx of todayTxs) {
        for (const item of tx.items) {
          const existing = itemMap.get(item.name) || { qty: 0, total: 0 };
          itemMap.set(item.name, {
            qty: existing.qty + item.qty,
            total: existing.total + item.price * item.qty,
          });
        }
      }

      setSummary({
        totalCash,
        totalQris,
        totalAll: totalCash + totalQris,
        transactionCount: todayTxs.length,
        items: Array.from(itemMap.entries()).map(([name, data]) => ({
          name,
          qty: data.qty,
          total: data.total,
        })),
      });
      setIsLoading(false);
    });
  }, [isAuthenticated, passphrase]);

  // ─── Handle kas fisik input ────────────────────────────────
  const handleKasFisikChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInputToNumber(e.target.value);
    setKasFisik(num);
    setKasFisikDisplay(formatInputDisplay(num));
  }, []);

  // ─── Submit tutup buku ─────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!summary || closingStatus === 'submitting') return;

    setClosingStatus('submitting');

    try {
      const response = await fetch('/api/v1/pos/daily-closing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          tenantId: 'default-tenant',
          cashOnHand: kasFisik > 0 ? kasFisik : summary.totalCash,
          notes: notes || `Tutup buku ${new Date().toLocaleDateString('id-ID')}. Kas fisik: ${formatRupiah(kasFisik)}. Kas sistem: ${formatRupiah(summary.totalCash)}.`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setClosingStatus('success');
        setClosingResult({ closingId: data.closingId, closedAt: data.closedAt });
        resetCash();
      } else {
        setClosingStatus('error');
      }
    } catch {
      setClosingStatus('error');
    }
  }, [summary, kasFisik, notes, closingStatus, resetCash]);

  const selisih = summary ? kasFisik - summary.totalCash : 0;

  // ═══════════════════════════════════════════════════════════════
  // RENDER: Login
  // ═══════════════════════════════════════════════════════════════

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Tutup Buku Harian
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              Masukkan passphrase untuk mengakses data transaksi terenkripsi.
            </p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
              placeholder="Passphrase operator"
              autoComplete="current-password"
              className="w-full text-lg font-mono"
              style={{
                minHeight: '48px',
                padding: '12px 16px',
                border: '4px solid var(--border-primary)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              aria-label="Passphrase operator untuk dekripsi data"
            />
            <button
              onClick={handleLogin}
              disabled={passphrase.length < 8}
              className="w-full font-black uppercase tracking-wider text-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              style={{
                minHeight: '48px',
                padding: '14px 24px',
                backgroundColor: 'var(--bg-invert)',
                color: 'var(--text-invert)',
                border: '4px solid var(--border-primary)',
              }}
              aria-label="Buka halaman tutup buku"
            >
              Buka Tutup Buku
            </button>
          </div>
          <div className="flex justify-between items-center">
            <a href="/pos" className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>← Kembali ke POS</a>
            <ThemeToggle />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER: Main
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <header className="px-4 py-3 sm:px-6" style={{ borderBottom: '4px solid var(--border-primary)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight">Tutup Buku Harian</h1>
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              KDKMP JASASAJA • Rekonsiliasi Kas & Jurnal SAK EP
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href="/pos"
              className="text-xs font-mono font-bold px-3 py-2 uppercase"
              style={{ minHeight: '48px', display: 'flex', alignItems: 'center', border: '2px solid var(--border-primary)', color: 'var(--text-primary)' }}
            >
              ← POS
            </a>
            <a
              href="/dashboard"
              className="text-xs font-mono font-bold px-3 py-2 uppercase"
              style={{ minHeight: '48px', display: 'flex', alignItems: 'center', border: '2px solid var(--border-secondary)', color: 'var(--text-muted)' }}
            >
              Dashboard
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {isLoading ? (
          <p className="text-center py-12 font-mono" style={{ color: 'var(--text-muted)' }}>Memuat data transaksi...</p>
        ) : !summary ? (
          <p className="text-center py-12 font-mono" style={{ color: 'var(--text-muted)' }}>Tidak ada data.</p>
        ) : (
          <>
            {/* Ringkasan Transaksi Hari Ini */}
            <div className="p-5" style={{ border: '4px solid var(--border-primary)' }}>
              <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text-primary)' }}>
                Ringkasan Hari Ini — {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="p-3" style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--border-muted)' }}>
                  <p className="text-xs font-mono uppercase" style={{ color: 'var(--text-faint)' }}>Total Tunai</p>
                  <p className="text-xl font-black font-mono" style={{ color: 'var(--accent-success)' }}>{formatRupiah(summary.totalCash)}</p>
                </div>
                <div className="p-3" style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--border-muted)' }}>
                  <p className="text-xs font-mono uppercase" style={{ color: 'var(--text-faint)' }}>Total QRIS</p>
                  <p className="text-xl font-black font-mono" style={{ color: 'var(--accent-info)' }}>{formatRupiah(summary.totalQris)}</p>
                </div>
                <div className="p-3" style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--border-muted)' }}>
                  <p className="text-xs font-mono uppercase" style={{ color: 'var(--text-faint)' }}>Jumlah Transaksi</p>
                  <p className="text-xl font-black font-mono">{summary.transactionCount}</p>
                </div>
              </div>

              {/* Detail Item */}
              {summary.items.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-mono uppercase mb-2" style={{ color: 'var(--text-faint)' }}>Detail Penjualan</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {summary.items.map((item) => (
                      <div key={item.name} className="flex justify-between text-sm py-1" style={{ borderBottom: '1px solid var(--border-muted)' }}>
                        <span>{item.name} × {item.qty}</span>
                        <span className="font-mono font-bold">{formatRupiah(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rekonsiliasi Kas Fisik */}
            <div className="p-5" style={{ border: '4px solid var(--border-primary)' }}>
              <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text-primary)' }}>
                Rekonsiliasi Kas Fisik
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="kas-fisik" className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Jumlah Kas Fisik di Brankas (hitung manual)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                      Rp
                    </span>
                    <input
                      id="kas-fisik"
                      type="text"
                      inputMode="numeric"
                      value={kasFisikDisplay}
                      onChange={handleKasFisikChange}
                      placeholder="0"
                      className="w-full text-xl font-mono font-bold pl-12 pr-4 py-3"
                      style={{
                        minHeight: '48px',
                        border: '4px solid var(--border-primary)',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                      }}
                      aria-label="Jumlah kas fisik di brankas"
                    />
                  </div>
                </div>

                {/* Perbandingan */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3" style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--border-muted)' }}>
                    <p className="text-xs font-mono uppercase" style={{ color: 'var(--text-faint)' }}>Kas Sistem</p>
                    <p className="text-lg font-black font-mono">{formatRupiah(summary.totalCash)}</p>
                  </div>
                  <div className="p-3" style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--border-muted)' }}>
                    <p className="text-xs font-mono uppercase" style={{ color: 'var(--text-faint)' }}>Kas Fisik</p>
                    <p className="text-lg font-black font-mono">{formatRupiah(kasFisik)}</p>
                  </div>
                  <div className="p-3" style={{ backgroundColor: 'var(--bg-secondary)', border: `2px solid ${selisih === 0 ? 'var(--accent-success)' : 'var(--accent-danger)'}` }}>
                    <p className="text-xs font-mono uppercase" style={{ color: 'var(--text-faint)' }}>Selisih</p>
                    <p className="text-lg font-black font-mono" style={{ color: selisih === 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                      {selisih === 0 ? '✓ Cocok' : formatRupiah(selisih)}
                    </p>
                  </div>
                </div>

                {selisih !== 0 && kasFisik > 0 && (
                  <p className="text-xs font-mono" style={{ color: 'var(--accent-warning)' }}>
                    ⚠ Terdapat selisih {formatRupiah(Math.abs(selisih))} antara kas fisik dan kas sistem. Pastikan semua transaksi sudah tercatat.
                  </p>
                )}
              </div>
            </div>

            {/* Catatan */}
            <div className="p-5" style={{ border: '4px solid var(--border-primary)' }}>
              <label htmlFor="closing-notes" className="block text-sm font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-primary)' }}>
                Catatan (Opsional)
              </label>
              <textarea
                id="closing-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan tambahan untuk penutupan hari ini..."
                rows={3}
                className="w-full text-sm font-mono p-3 resize-none"
                style={{
                  border: '3px solid var(--border-secondary)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
                aria-label="Catatan penutupan buku"
              />
            </div>

            {/* Tombol Submit */}
            {closingStatus === 'success' ? (
              <div className="p-5" style={{ border: '4px solid var(--accent-success)', backgroundColor: 'var(--bg-secondary)' }}>
                <p className="text-lg font-black uppercase" style={{ color: 'var(--accent-success)' }}>
                  ✓ Tutup Buku Berhasil
                </p>
                <p className="text-sm font-mono mt-2" style={{ color: 'var(--text-muted)' }}>
                  Jurnal SAK EP telah di-generate otomatis (Debit Kas, Kredit Pendapatan).
                </p>
                {closingResult && (
                  <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-faint)' }}>
                    ID: {closingResult.closingId} • {closingResult.closedAt}
                  </p>
                )}
                <a
                  href="/dashboard"
                  className="inline-block mt-4 font-black uppercase tracking-wider text-sm cursor-pointer"
                  style={{
                    minHeight: '48px',
                    padding: '14px 24px',
                    backgroundColor: 'var(--bg-invert)',
                    color: 'var(--text-invert)',
                    border: '3px solid var(--border-primary)',
                  }}
                >
                  Kembali ke Dashboard
                </a>
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={closingStatus === 'submitting' || summary.transactionCount === 0}
                className="w-full font-black uppercase tracking-wider text-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition-all"
                style={{
                  minHeight: '56px',
                  padding: '16px',
                  backgroundColor: 'var(--bg-invert)',
                  color: 'var(--text-invert)',
                  border: '4px solid var(--border-primary)',
                }}
                aria-label="Tutup buku harian dan generate jurnal SAK EP"
              >
                {closingStatus === 'submitting' ? 'Memproses...' : 'Tutup Buku & Generate Jurnal SAK EP'}
              </button>
            )}

            {closingStatus === 'error' && (
              <div className="p-3" style={{ border: '2px solid var(--accent-danger)', backgroundColor: 'var(--bg-secondary)' }} role="alert">
                <p className="text-xs font-bold" style={{ color: 'var(--accent-danger)' }}>
                  ✗ Gagal mengirim data tutup buku. Periksa koneksi dan coba lagi.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="px-4 py-3 mt-4" style={{ borderTop: '2px solid var(--border-muted)' }}>
        <p className="text-center text-xs font-mono" style={{ color: 'var(--text-faint)' }}>
          Kepatuhan: SAK EP • Inpres 17/2025 • PP 60/2008 (SPIP) • Jurnal Ganda Otomatis via Database Trigger
        </p>
      </footer>
    </div>
  );
}

'use client';

/**
 * ============================================================================
 * KDKMP JASASAJA — POS Lockout Engine (Zustand + Brutalist UI)
 * ============================================================================
 * Hierarki: Master Validator > Gem 3/4 > Gem 2
 *
 * Kepatuhan BPKP:
 *   Batas kas tunai brankas gerai: Rp50.000.000
 *   Jika terlampaui → BLOKIR TOTAL menu POS di level browser
 *   Hanya bisa dibuka dengan kode bukti setor bank (min 8 karakter)
 *
 * Desain:
 *   - Brutalistik kontras tinggi (#FFFFFF background, #1A1A1A text)
 *   - Tombol minimal 48dp × 48dp (operator paruh baya desa)
 *   - Full-screen overlay yang tidak bisa di-dismiss
 *
 * Arsitektur:
 *   - Zustand store melacak cash_on_hand dari IndexedDB
 *   - Reaktif: lockout otomatis saat threshold terlampaui
 *   - Luring-aman: bekerja tanpa koneksi internet
 * ============================================================================
 */

import { create } from 'zustand';
import { useState, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// KONSTANTA
// ═══════════════════════════════════════════════════════════════

const CASH_LIMIT = 50_000_000; // Rp50.000.000 — batas audit BPKP
const MIN_DEPOSIT_CODE_LENGTH = 8;

// ═══════════════════════════════════════════════════════════════
// ZUSTAND STORE: Cash Controller
// ═══════════════════════════════════════════════════════════════

interface CashStore {
  cashOnHand: number;
  isLocked: boolean;
  setCashOnHand: (amount: number) => void;
  addCash: (amount: number) => void;
  resetCash: () => void;
}

export const useCashStore = create<CashStore>((set, get) => ({
  cashOnHand: 0,
  isLocked: false,

  setCashOnHand: (amount: number) => {
    set({
      cashOnHand: amount,
      isLocked: amount > CASH_LIMIT,
    });
  },

  addCash: (amount: number) => {
    const newTotal = get().cashOnHand + amount;
    set({
      cashOnHand: newTotal,
      isLocked: newTotal > CASH_LIMIT,
    });
  },

  resetCash: () => {
    set({ cashOnHand: 0, isLocked: false });
  },
}));

// ═══════════════════════════════════════════════════════════════
// FORMAT HELPER
// ═══════════════════════════════════════════════════════════════

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ═══════════════════════════════════════════════════════════════
// KOMPONEN: Full-Screen Lockout Overlay
// ═══════════════════════════════════════════════════════════════

export default function POSLockout() {
  const { isLocked, cashOnHand, resetCash } = useCashStore();
  const [depositCode, setDepositCode] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Reset error saat user mengetik
  useEffect(() => {
    if (error && depositCode.length > 0) {
      setError('');
    }
  }, [depositCode, error]);

  const handleUnlock = useCallback(() => {
    setError('');

    // Validasi panjang minimum kode setor
    if (depositCode.length < MIN_DEPOSIT_CODE_LENGTH) {
      setError(`Kode bukti setor minimal ${MIN_DEPOSIT_CODE_LENGTH} karakter.`);
      return;
    }

    // Validasi format: hanya alfanumerik
    if (!/^[A-Za-z0-9]+$/.test(depositCode)) {
      setError('Kode hanya boleh berisi huruf dan angka.');
      return;
    }

    setIsValidating(true);

    // Simulasi validasi (di produksi: verifikasi ke API bank/CMS)
    setTimeout(() => {
      // Reset kas ke 0 dan buka lockout
      resetCash();
      setDepositCode('');
      setIsValidating(false);
    }, 500);
  }, [depositCode, resetCash]);

  // Jangan render jika tidak terkunci
  if (!isLocked) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: '#FFFFFF' }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="lockout-title"
      aria-describedby="lockout-desc"
    >
      <div className="w-full max-w-lg text-center" style={{ color: '#1A1A1A' }}>
        {/* Ikon Peringatan */}
        <div
          className="mx-auto mb-6 flex items-center justify-center"
          style={{
            width: '80px',
            height: '80px',
            border: '6px solid #1A1A1A',
          }}
        >
          <span className="text-4xl font-black" aria-hidden="true">⚠</span>
        </div>

        {/* Judul */}
        <h1
          id="lockout-title"
          className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-4"
          style={{ color: '#1A1A1A' }}
        >
          TRANSAKSI DIBLOKIR
        </h1>

        {/* Deskripsi */}
        <p
          id="lockout-desc"
          className="text-base sm:text-lg mb-6 leading-relaxed"
          style={{ color: '#1A1A1A' }}
        >
          Saldo kas brankas telah melampaui batas aman{' '}
          <strong>{formatRupiah(CASH_LIMIT)}</strong>.
          <br />
          Segera lakukan penyetoran ke bank melalui CMS.
        </p>

        {/* Indikator Saldo */}
        <div
          className="mb-8 p-4 text-center"
          style={{ border: '4px solid #1A1A1A', backgroundColor: '#FEF2F2' }}
        >
          <p className="text-xs font-mono uppercase tracking-widest mb-1">
            Saldo Kas Saat Ini
          </p>
          <p className="text-3xl sm:text-4xl font-black font-mono" style={{ color: '#DC2626' }}>
            {formatRupiah(cashOnHand)}
          </p>
          <p className="text-xs mt-2" style={{ color: '#6B7280' }}>
            Melebihi batas: {formatRupiah(cashOnHand - CASH_LIMIT)}
          </p>
        </div>

        {/* Form Input Kode Setor */}
        <div className="space-y-4">
          <label
            htmlFor="deposit-code"
            className="block text-sm font-black uppercase tracking-wider text-left"
          >
            Masukkan Kode Bukti Setor Bank (min. 8 karakter):
          </label>

          <input
            id="deposit-code"
            type="text"
            value={depositCode}
            onChange={(e) => setDepositCode(e.target.value.toUpperCase())}
            placeholder="Contoh: CMS12345"
            maxLength={20}
            autoComplete="off"
            className="w-full font-mono text-lg font-bold text-center uppercase tracking-widest"
            style={{
              minHeight: '48px',
              padding: '12px 16px',
              border: '4px solid #1A1A1A',
              backgroundColor: '#FFFFFF',
              color: '#1A1A1A',
              outline: 'none',
            }}
            aria-describedby={error ? 'deposit-error' : undefined}
          />

          {error && (
            <p
              id="deposit-error"
              className="text-sm font-bold text-left"
              style={{ color: '#DC2626' }}
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleUnlock}
            disabled={isValidating || depositCode.length < MIN_DEPOSIT_CODE_LENGTH}
            className="w-full font-black uppercase tracking-wider text-lg transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            style={{
              minHeight: '48px',
              minWidth: '48px',
              padding: '14px 24px',
              backgroundColor: '#1A1A1A',
              color: '#FFFFFF',
              border: '4px solid #1A1A1A',
            }}
            aria-label="Verifikasi kode setor dan buka blokir POS"
          >
            {isValidating ? 'MEMVERIFIKASI...' : 'VERIFIKASI & BUKA BLOKIR'}
          </button>
        </div>

        {/* Informasi Bantuan */}
        <p className="mt-6 text-xs" style={{ color: '#6B7280' }}>
          Hubungi supervisor jika tidak memiliki kode bukti setor.
          <br />
          Kepatuhan: PP 60/2008 (SPIP) • Audit BPKP • Batas Brankas Rp50 Juta
        </p>
      </div>
    </div>
  );
}

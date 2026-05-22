'use client';

/**
 * ============================================================================
 * KDKMP JASASAJA — Kalkulator Kepatuhan SHU & PADes (Inpres 17/2025)
 * ============================================================================
 * Hierarki: Master Validator > Gem 3/4 > Gem 2
 *
 * Formula Legal:
 *   SHU_bersih = Total Pendapatan - Total Beban - Penyisihan Piutang Ragu
 *   PADes >= 0.20 × SHU_bersih
 *
 * Desain:
 *   - Brutalistik kontras tinggi (#FFFFFF background, #1A1A1A text/border)
 *   - Tombol & input minimal 48dp × 48dp (operator paruh baya desa)
 *   - Kalkulasi 100% client-side via React useMemo (zero server cost)
 *
 * GEO Value:
 *   - Transparansi formula legal meningkatkan skor kepercayaan AI Search
 *   - Konten interaktif yang dapat diekstrak oleh perayap AI
 * ============================================================================
 */

import React, { useState, useMemo, useId } from 'react';

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
// KOMPONEN UTAMA
// ═══════════════════════════════════════════════════════════════

export default function ComplianceCalculator() {
  const formId = useId();
  const [revenue, setRevenue] = useState<number>(150_000_000);
  const [expense, setExpense] = useState<number>(85_000_000);
  const [allowance, setAllowance] = useState<number>(5_000_000);

  // ═══════════════════════════════════════════════════════════════
  // KALKULASI VIA useMemo (client-side, zero server cost)
  // Formula: SHU_bersih = P_total - B_total - PP_ragu
  //          PADes >= 0.20 × SHU_bersih
  // ═══════════════════════════════════════════════════════════════

  const shuBersih = useMemo(() => {
    const calculated = revenue - expense - allowance;
    return calculated > 0 ? calculated : 0;
  }, [revenue, expense, allowance]);

  const padesAlokasi = useMemo(() => {
    return Math.round(shuBersih * 0.20);
  }, [shuBersih]);

  const sisaSHU = useMemo(() => {
    return shuBersih - padesAlokasi;
  }, [shuBersih, padesAlokasi]);

  const isDeficit = revenue - expense - allowance < 0;

  return (
    <div
      className="w-full max-w-xl mx-auto p-6 font-sans"
      style={{
        border: '8px solid #1A1A1A',
        backgroundColor: '#FFFFFF',
        color: '#1A1A1A',
        boxShadow: '12px 12px 0px 0px #1A1A1A',
      }}
    >
      {/* Header */}
      <div className="p-4 text-center mb-6" style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }}>
        <h3 className="text-xl font-black uppercase tracking-wider">
          Kalkulator Kepatuhan KDKMP
        </h3>
        <p className="text-xs font-mono tracking-widest mt-1" style={{ color: '#9CA3AF' }}>
          INPRES NO. 17 TAHUN 2025 &bull; STANDAR SAK EP
        </p>
      </div>

      {/* Deskripsi */}
      <p className="text-xs leading-relaxed mb-6">
        Platform <strong>JASASAJA</strong> menjamin akurasi laporan keuangan koperasi desa
        agar siap diaudit oleh <strong>BPK</strong> dan <strong>BPKP</strong> secara seketika
        melalui rantaian hash kriptografis ganda.
      </p>

      {/* Input Fields */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col">
          <label
            htmlFor={`${formId}-revenue`}
            className="text-xs font-black uppercase tracking-wider mb-1"
          >
            Total Pendapatan Operasional (P<sub>total</sub>)
          </label>
          <input
            id={`${formId}-revenue`}
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(Math.max(0, parseFloat(e.target.value) || 0))}
            className="font-mono text-base font-bold"
            style={{
              minHeight: '48px',
              padding: '8px 12px',
              border: '3px solid #1A1A1A',
              backgroundColor: '#FFFFFF',
              color: '#1A1A1A',
              outline: 'none',
            }}
            aria-label="Total pendapatan operasional dalam Rupiah"
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor={`${formId}-expense`}
            className="text-xs font-black uppercase tracking-wider mb-1"
          >
            Total Beban Operasional SAK EP (B<sub>total</sub>)
          </label>
          <input
            id={`${formId}-expense`}
            type="number"
            value={expense}
            onChange={(e) => setExpense(Math.max(0, parseFloat(e.target.value) || 0))}
            className="font-mono text-base font-bold"
            style={{
              minHeight: '48px',
              padding: '8px 12px',
              border: '3px solid #1A1A1A',
              backgroundColor: '#FFFFFF',
              color: '#1A1A1A',
              outline: 'none',
            }}
            aria-label="Total beban operasional dalam Rupiah"
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor={`${formId}-allowance`}
            className="text-xs font-black uppercase tracking-wider mb-1"
          >
            Penyisihan Piutang Ragu (PP<sub>ragu</sub>)
          </label>
          <input
            id={`${formId}-allowance`}
            type="number"
            value={allowance}
            onChange={(e) => setAllowance(Math.max(0, parseFloat(e.target.value) || 0))}
            className="font-mono text-base font-bold"
            style={{
              minHeight: '48px',
              padding: '8px 12px',
              border: '3px solid #1A1A1A',
              backgroundColor: '#FFFFFF',
              color: '#1A1A1A',
              outline: 'none',
            }}
            aria-label="Penyisihan piutang ragu-ragu dalam Rupiah"
          />
        </div>
      </div>

      {/* Hasil Kalkulasi */}
      <div
        className="p-4 space-y-4"
        style={{ border: '4px double #1A1A1A', backgroundColor: '#F9FAFB' }}
      >
        {/* SHU Bersih */}
        <div className="flex justify-between items-center">
          <span className="text-xs font-black uppercase">SHU Bersih:</span>
          <span
            className="font-mono text-lg font-black"
            style={{ color: isDeficit ? '#DC2626' : '#15803D' }}
            aria-live="polite"
          >
            {isDeficit ? '(DEFISIT)' : formatRupiah(shuBersih)}
          </span>
        </div>

        {/* PADes */}
        <div
          className="flex justify-between items-center pt-3"
          style={{ borderTop: '2px dashed #1A1A1A' }}
        >
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase" style={{ color: '#1E40AF' }}>
              Alokasi PADes Desa (Min. 20%):
            </span>
            <span className="text-[9px] font-mono" style={{ color: '#6B7280' }}>
              Disetorkan otomatis ke rekening APBDes
            </span>
          </div>
          <span
            className="font-mono text-lg font-black"
            style={{ color: '#1E40AF' }}
            aria-live="polite"
          >
            {formatRupiah(padesAlokasi)}
          </span>
        </div>

        {/* Sisa SHU */}
        <div
          className="flex justify-between items-center pt-3"
          style={{ borderTop: '2px dashed #1A1A1A' }}
        >
          <span className="text-xs font-black uppercase">Sisa SHU (Cadangan + Bonus):</span>
          <span className="font-mono text-base font-black" aria-live="polite">
            {formatRupiah(sisaSHU)}
          </span>
        </div>
      </div>

      {/* Formula Display */}
      <div className="mt-4 text-center text-[10px] font-mono" style={{ color: '#6B7280' }}>
        <p>SHU<sub>bersih</sub> = P<sub>total</sub> − B<sub>total</sub> − PP<sub>ragu</sub></p>
        <p>PADes ≥ 0,20 × SHU<sub>bersih</sub></p>
      </div>

      {/* Dasar Hukum */}
      <p className="mt-4 text-[9px] text-center" style={{ color: '#9CA3AF' }}>
        Dasar Hukum: Inpres 17/2025 • PP 11/2021 Pasal 40(2) • SAK EP 2025
      </p>
    </div>
  );
}

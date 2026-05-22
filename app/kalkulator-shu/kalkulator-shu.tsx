'use client';

/**
 * ============================================================================
 * KOMPONEN KALKULATOR SHU (Client-Side Interactive)
 * ============================================================================
 * Desain Brutalistik:
 *   - Kontras tinggi: #FFFFFF teks pada #1A1A1A background
 *   - Tombol minimal 48dp × 48dp (aksesibilitas operator paruh baya)
 *   - Font besar, spacing lega, label jelas
 * 
 * Kalkulasi via React useMemo (zero server cost):
 *   SHU_bersih = Total Pendapatan - Total Beban - Penyisihan Piutang Ragu
 *   PADes ≥ 0,20 × SHU_bersih
 * ============================================================================
 */

import { useState, useMemo, useId } from 'react';

// Format angka ke Rupiah
function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Parse input string ke number (handle titik sebagai pemisah ribuan)
function parseInputToNumber(raw: string): number {
  const cleaned = raw.replace(/[^\d]/g, '');
  return cleaned === '' ? 0 : parseInt(cleaned, 10);
}

// Format input display dengan titik ribuan
function formatInputDisplay(value: number): string {
  if (value === 0) return '';
  return new Intl.NumberFormat('id-ID').format(value);
}

interface InputFieldProps {
  id: string;
  label: string;
  sublabel?: string;
  value: number;
  onChange: (val: number) => void;
}

function InputField({ id, label, sublabel, value, onChange }: InputFieldProps) {
  const [displayValue, setDisplayValue] = useState(formatInputDisplay(value));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const num = parseInputToNumber(raw);
    setDisplayValue(formatInputDisplay(num));
    onChange(num);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
        {label}
      </label>
      {sublabel && (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{sublabel}</p>
      )}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-base sm:text-lg pointer-events-none" style={{ color: 'var(--text-muted)' }}>
          Rp
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder="0"
          aria-label={label}
          className="w-full min-h-[48px] pl-12 pr-4 py-3 sm:py-4 text-lg sm:text-xl font-mono font-bold rounded-none transition-colors"
          style={{
            border: '4px solid var(--border-primary)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
          }}
        />
      </div>
    </div>
  );
}

export default function KalkulatorSHU() {
  const formId = useId();

  // State input
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [totalBeban, setTotalBeban] = useState(0);
  const [penyisihanPiutang, setPenyisihanPiutang] = useState(0);

  // ═══════════════════════════════════════════════════════════════
  // KALKULASI VIA useMemo (client-side, zero server cost)
  // Formula Legal:
  //   SHU_bersih = Total Pendapatan - Total Beban - Penyisihan Piutang Ragu
  //   PADes ≥ 0,20 × SHU_bersih
  // ═══════════════════════════════════════════════════════════════
  const hasil = useMemo(() => {
    const shuBersih = totalPendapatan - totalBeban - penyisihanPiutang;
    const padesMinimum = shuBersih > 0 ? Math.ceil(shuBersih * 0.20) : 0;
    const sisaSHU = shuBersih > 0 ? shuBersih - padesMinimum : shuBersih;

    return {
      shuBersih,
      padesMinimum,
      sisaSHU,
      isPositif: shuBersih > 0,
      persenPADes: 20,
    };
  }, [totalPendapatan, totalBeban, penyisihanPiutang]);

  // Reset semua input
  const handleReset = () => {
    setTotalPendapatan(0);
    setTotalBeban(0);
    setPenyisihanPiutang(0);
  };

  return (
    <section className="px-4 py-8 sm:px-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Formula Display */}
        <div className="p-4 sm:p-6" style={{ border: '4px solid var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
          <h2 className="text-sm font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Formula Legal
          </h2>
          <div className="space-y-2 font-mono text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
            <p>
              <span className="font-bold" style={{ color: 'var(--accent-warning)' }}>SHU<sub>bersih</sub></span>
              {' = Total Pendapatan − Total Beban − Penyisihan Piutang Ragu'}
            </p>
            <p>
              <span className="font-bold" style={{ color: 'var(--accent-success)' }}>PADes</span>
              {' ≥ 0,20 × SHU'}
              <sub>bersih</sub>
            </p>
          </div>
        </div>

        {/* Input Fields */}
        <fieldset className="space-y-6">
          <legend className="text-xs font-mono uppercase tracking-widest mb-4 pb-2 w-full block" style={{ color: 'var(--text-faint)', borderBottom: '1px solid var(--border-muted)' }}>
            Masukkan Angka (dalam Rupiah)
          </legend>

          <InputField
            id={`${formId}-pendapatan`}
            label="Total Pendapatan"
            sublabel="Seluruh pendapatan usaha dalam 1 periode (penjualan + jasa)"
            value={totalPendapatan}
            onChange={setTotalPendapatan}
          />

          <InputField
            id={`${formId}-beban`}
            label="Total Beban"
            sublabel="Seluruh beban operasional (gaji, sewa, utilitas, HPP, dll)"
            value={totalBeban}
            onChange={setTotalBeban}
          />

          <InputField
            id={`${formId}-penyisihan`}
            label="Penyisihan Piutang Ragu-Ragu"
            sublabel="Estimasi piutang yang tidak tertagih (cadangan kerugian)"
            value={penyisihanPiutang}
            onChange={setPenyisihanPiutang}
          />
        </fieldset>

        {/* Tombol Aksi - min 48dp x 48dp */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset semua input ke nol"
            className="min-h-[48px] min-w-[48px] px-6 py-3 text-base sm:text-lg font-black uppercase tracking-wider cursor-pointer transition-colors"
            style={{
              backgroundColor: 'var(--bg-invert)',
              color: 'var(--text-invert)',
              border: '4px solid var(--border-primary)',
            }}
          >
            ↺ Reset
          </button>
        </div>

        {/* HASIL KALKULASI */}
        <div style={{ border: '4px solid var(--border-primary)' }}>
          {/* SHU Bersih */}
          <div className="p-4 sm:p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Sisa Hasil Usaha (SHU) Bersih
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>
                  = {formatRupiah(totalPendapatan)} − {formatRupiah(totalBeban)} − {formatRupiah(penyisihanPiutang)}
                </p>
              </div>
              <p
                className="text-2xl sm:text-3xl font-black font-mono"
                style={{ color: hasil.isPositif ? 'var(--accent-warning)' : 'var(--accent-danger)' }}
                aria-live="polite"
                aria-label={`SHU Bersih: ${formatRupiah(hasil.shuBersih)}`}
              >
                {formatRupiah(hasil.shuBersih)}
              </p>
            </div>
          </div>

          {/* PADes Minimum */}
          <div className="p-4 sm:p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '4px solid var(--border-primary)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  PADes Minimum (≥ 20% SHU)
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>
                  = 20% × {formatRupiah(Math.max(hasil.shuBersih, 0))}
                </p>
              </div>
              <p
                className="text-2xl sm:text-3xl font-black font-mono"
                style={{ color: 'var(--accent-success)' }}
                aria-live="polite"
                aria-label={`PADes minimum: ${formatRupiah(hasil.padesMinimum)}`}
              >
                {formatRupiah(hasil.padesMinimum)}
              </p>
            </div>
            {!hasil.isPositif && (
              <p className="mt-3 text-sm font-bold pl-3" style={{ color: 'var(--accent-danger)', borderLeft: '4px solid var(--accent-danger)' }}>
                ⚠ SHU negatif (rugi) — tidak ada kewajiban PADes pada periode ini.
              </p>
            )}
          </div>

          {/* Sisa SHU setelah PADes */}
          <div className="p-4 sm:p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '4px solid var(--border-primary)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Sisa SHU (Setelah PADes)
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>
                  Dapat dialokasikan untuk cadangan, bonus pengurus, dan anggota
                </p>
              </div>
              <p
                className="text-2xl sm:text-3xl font-black font-mono"
                style={{ color: 'var(--text-primary)' }}
                aria-live="polite"
                aria-label={`Sisa SHU: ${formatRupiah(hasil.sisaSHU)}`}
              >
                {formatRupiah(hasil.sisaSHU)}
              </p>
            </div>
          </div>
        </div>

        {/* Penjelasan untuk operator desa */}
        <div className="p-4 sm:p-6 space-y-3" style={{ border: '4px solid var(--border-secondary)' }}>
          <h3 className="text-base font-bold uppercase">Cara Menggunakan</h3>
          <ol className="list-decimal list-inside space-y-2 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <li>
              <strong>Total Pendapatan</strong> — Masukkan jumlah seluruh pemasukan usaha
              dalam satu periode (bulan/tahun).
            </li>
            <li>
              <strong>Total Beban</strong> — Masukkan jumlah seluruh pengeluaran operasional
              (gaji karyawan, sewa, listrik, pembelian barang dagangan, dll).
            </li>
            <li>
              <strong>Penyisihan Piutang</strong> — Masukkan estimasi piutang yang kemungkinan
              tidak bisa ditagih (jika tidak ada, isi 0).
            </li>
            <li>
              Hasil <strong>SHU Bersih</strong> dan <strong>PADes minimum 20%</strong> akan
              otomatis terhitung di bawah.
            </li>
          </ol>
        </div>

      </div>
    </section>
  );
}

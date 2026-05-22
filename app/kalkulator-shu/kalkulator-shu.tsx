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
    // Pilih semua teks saat fokus untuk kemudahan edit
    e.target.select();
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-base sm:text-lg font-bold text-[#FFFFFF]">
        {label}
      </label>
      {sublabel && (
        <p className="text-sm text-neutral-400">{sublabel}</p>
      )}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-base sm:text-lg pointer-events-none">
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
          className="w-full min-h-[48px] pl-12 pr-4 py-3 sm:py-4 bg-[#FFFFFF] text-[#1A1A1A] text-lg sm:text-xl font-mono font-bold border-4 border-[#FFFFFF] rounded-none focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/30 transition-colors placeholder:text-neutral-400"
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
        <div className="border-4 border-[#FFFFFF] p-4 sm:p-6 bg-[#0D0D0D]">
          <h2 className="text-sm font-mono uppercase tracking-widest text-neutral-400 mb-3">
            Formula Legal
          </h2>
          <div className="space-y-2 font-mono text-sm sm:text-base text-[#FFFFFF]">
            <p>
              <span className="text-yellow-400 font-bold">SHU<sub>bersih</sub></span>
              {' = Total Pendapatan − Total Beban − Penyisihan Piutang Ragu'}
            </p>
            <p>
              <span className="text-green-400 font-bold">PADes</span>
              {' ≥ 0,20 × SHU'}
              <sub>bersih</sub>
            </p>
          </div>
        </div>

        {/* Input Fields */}
        <fieldset className="space-y-6">
          <legend className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4 border-b border-neutral-700 pb-2 w-full block">
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
            className="min-h-[48px] min-w-[48px] px-6 py-3 bg-[#FFFFFF] text-[#1A1A1A] text-base sm:text-lg font-black uppercase tracking-wider border-4 border-[#FFFFFF] hover:bg-neutral-200 active:bg-neutral-300 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 transition-colors cursor-pointer"
          >
            ↺ Reset
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* HASIL KALKULASI */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="border-4 border-[#FFFFFF] divide-y-4 divide-[#FFFFFF]">
          {/* SHU Bersih */}
          <div className={`p-4 sm:p-6 ${hasil.isPositif ? 'bg-[#0D0D0D]' : 'bg-red-950'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                  Sisa Hasil Usaha (SHU) Bersih
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  = {formatRupiah(totalPendapatan)} − {formatRupiah(totalBeban)} − {formatRupiah(penyisihanPiutang)}
                </p>
              </div>
              <p
                className={`text-2xl sm:text-3xl font-black font-mono ${
                  hasil.isPositif ? 'text-yellow-400' : 'text-red-400'
                }`}
                aria-live="polite"
                aria-label={`SHU Bersih: ${formatRupiah(hasil.shuBersih)}`}
              >
                {formatRupiah(hasil.shuBersih)}
              </p>
            </div>
          </div>

          {/* PADes Minimum */}
          <div className="p-4 sm:p-6 bg-[#0D0D0D]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                  PADes Minimum (≥ 20% SHU)
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  = 20% × {formatRupiah(Math.max(hasil.shuBersih, 0))}
                </p>
              </div>
              <p
                className="text-2xl sm:text-3xl font-black font-mono text-green-400"
                aria-live="polite"
                aria-label={`PADes minimum: ${formatRupiah(hasil.padesMinimum)}`}
              >
                {formatRupiah(hasil.padesMinimum)}
              </p>
            </div>
            {!hasil.isPositif && (
              <p className="mt-3 text-sm text-red-400 font-bold border-l-4 border-red-400 pl-3">
                ⚠ SHU negatif (rugi) — tidak ada kewajiban PADes pada periode ini.
              </p>
            )}
          </div>

          {/* Sisa SHU setelah PADes */}
          <div className="p-4 sm:p-6 bg-[#0D0D0D]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                  Sisa SHU (Setelah PADes)
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  Dapat dialokasikan untuk cadangan, bonus pengurus, dan anggota
                </p>
              </div>
              <p
                className="text-2xl sm:text-3xl font-black font-mono text-[#FFFFFF]"
                aria-live="polite"
                aria-label={`Sisa SHU: ${formatRupiah(hasil.sisaSHU)}`}
              >
                {formatRupiah(hasil.sisaSHU)}
              </p>
            </div>
          </div>
        </div>

        {/* Penjelasan untuk operator desa */}
        <div className="border-4 border-neutral-700 p-4 sm:p-6 space-y-3">
          <h3 className="text-base font-bold uppercase">Cara Menggunakan</h3>
          <ol className="list-decimal list-inside space-y-2 text-base text-neutral-300 leading-relaxed">
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

/**
 * ============================================================================
 * KALKULATOR SHU & PADes - Kepatuhan Transparansi Hukum (Inpres 17/2025)
 * ============================================================================
 * Desain: Brutalistik kontras tinggi (#FFFFFF / #1A1A1A)
 * Target User: Operator paruh baya di desa (tombol min 48dp x 48dp)
 * Rendering: Static (force-static) → zero runtime cost, GEO-optimized
 * Kalkulasi: Client-side via React useMemo (no server round-trip)
 * 
 * Formula Legal:
 *   SHU_bersih = Total Pendapatan - Total Beban - Penyisihan Piutang Ragu
 *   PADes ≥ 0,20 × SHU_bersih
 * ============================================================================
 */

import { Metadata } from 'next';
import KalkulatorSHU from './kalkulator-shu';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Kalkulator SHU & PADes - KDKMP JASASAJA | Inpres 17/2025',
  description:
    'Kalkulator interaktif Sisa Hasil Usaha (SHU) dan Pendapatan Asli Desa (PADes) sesuai formula legal Inpres 17/2025. Gratis, transparan, tanpa login.',
  keywords: [
    'kalkulator SHU',
    'PADes',
    'Inpres 17/2025',
    'transparansi keuangan desa',
    'KDKMP JASASAJA',
    'BUMDes',
    'akuntansi desa',
  ],
  openGraph: {
    title: 'Kalkulator SHU & PADes - Inpres 17/2025',
    description:
      'Hitung SHU bersih dan kontribusi PADes minimum 20% secara transparan.',
    type: 'website',
  },
};

export default function KalkulatorSHUPage() {
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-[#FFFFFF] font-sans">
      {/* Header */}
      <header className="border-b-4 border-[#FFFFFF] px-4 py-6 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm font-mono uppercase tracking-widest text-neutral-400 mb-2">
            Kepatuhan Inpres 17/2025 — Transparansi Hukum
          </p>
          <h1 className="text-2xl sm:text-4xl font-black uppercase leading-tight">
            Kalkulator SHU &amp; PADes
          </h1>
          <p className="mt-3 text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl">
            Hitung Sisa Hasil Usaha bersih dan kontribusi minimum Pendapatan Asli Desa
            secara transparan. Semua kalkulasi berjalan di perangkat Anda — tidak ada data
            yang dikirim ke server.
          </p>
        </div>
      </header>

      {/* Kalkulator Client Component */}
      <KalkulatorSHU />

      {/* Footer Legal */}
      <footer className="border-t-4 border-[#FFFFFF] px-4 py-6 sm:px-8">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider">Dasar Hukum</h2>
          <ul className="text-sm text-neutral-400 space-y-1 list-disc list-inside">
            <li>Instruksi Presiden Nomor 17 Tahun 2025 tentang Transparansi Keuangan Desa</li>
            <li>PP 11/2021 tentang BUMDes — Pasal 40 ayat (2): PADes minimal 20% dari SHU bersih</li>
            <li>SAK EP (Standar Akuntansi Keuangan Entitas Privat)</li>
          </ul>
          <p className="text-xs text-neutral-500 mt-4">
            © 2025 KDKMP JASASAJA. Kalkulator ini bersifat informatif dan tidak menggantikan
            audit resmi. Halaman ini di-render statis (SSG) dan tidak membebankan biaya komputasi.
          </p>
        </div>
      </footer>
    </main>
  );
}

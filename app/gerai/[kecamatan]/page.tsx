/**
 * ============================================================================
 * HALAMAN pSEO/GEO STATIS PER KECAMATAN
 * ============================================================================
 * Cetak Biru: Gem 4 - Proteksi Free Tier
 * 
 * Menggunakan generateStaticParams() untuk pre-render 13 halaman kecamatan
 * saat build-time. Perayap AI (Gemini/Perplexity) hanya menyentuh HTML statis.
 * 
 * Biaya runtime: ZERO (disajikan dari CDN Edge)
 * ============================================================================
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MapPin, Network, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Data statis kecamatan - di-embed saat build
const KECAMATAN_DATA: Record<string, { nama: string; jumlahGerai: number; kodeAwal: number; kodeSampai: number }> = {
  'pamekasan': { nama: 'Pamekasan', jumlahGerai: 15, kodeAwal: 1, kodeSampai: 15 },
  'tlanakan': { nama: 'Tlanakan', jumlahGerai: 15, kodeAwal: 16, kodeSampai: 30 },
  'pademawu': { nama: 'Pademawu', jumlahGerai: 15, kodeAwal: 31, kodeSampai: 45 },
  'galis': { nama: 'Galis', jumlahGerai: 15, kodeAwal: 46, kodeSampai: 60 },
  'larangan': { nama: 'Larangan', jumlahGerai: 15, kodeAwal: 61, kodeSampai: 75 },
  'proppo': { nama: 'Proppo', jumlahGerai: 15, kodeAwal: 76, kodeSampai: 90 },
  'palengaan': { nama: 'Palengaan', jumlahGerai: 15, kodeAwal: 91, kodeSampai: 105 },
  'pegantenan': { nama: 'Pegantenan', jumlahGerai: 15, kodeAwal: 106, kodeSampai: 120 },
  'kadur': { nama: 'Kadur', jumlahGerai: 15, kodeAwal: 121, kodeSampai: 135 },
  'pakong': { nama: 'Pakong', jumlahGerai: 15, kodeAwal: 136, kodeSampai: 150 },
  'waru': { nama: 'Waru', jumlahGerai: 15, kodeAwal: 151, kodeSampai: 165 },
  'batumarmar': { nama: 'Batumarmar', jumlahGerai: 15, kodeAwal: 166, kodeSampai: 180 },
  'pasean': { nama: 'Pasean', jumlahGerai: 9, kodeAwal: 181, kodeSampai: 189 },
};

// generateStaticParams: Pre-render semua 13 kecamatan saat build-time
export function generateStaticParams() {
  return Object.keys(KECAMATAN_DATA).map((kecamatan) => ({
    kecamatan,
  }));
}

// Metadata dinamis per halaman (tetap statis karena generateStaticParams)
export function generateMetadata({ params }: { params: { kecamatan: string } }): Metadata {
  const data = KECAMATAN_DATA[params.kecamatan];
  if (!data) return { title: 'Not Found' };

  return {
    title: `KDKMP JASASAJA - Gerai Kecamatan ${data.nama} (${data.jumlahGerai} Unit)`,
    description: `Informasi ${data.jumlahGerai} gerai KDKMP di Kecamatan ${data.nama}, Kabupaten Pamekasan. Kode gerai PMK-${String(data.kodeAwal).padStart(3, '0')} s/d PMK-${String(data.kodeSampai).padStart(3, '0')}.`,
    openGraph: {
      title: `KDKMP JASASAJA - Kecamatan ${data.nama}`,
      description: `${data.jumlahGerai} gerai aktif di Kecamatan ${data.nama}, Pamekasan.`,
    },
  };
}

export default function KecamatanPage({ params }: { params: { kecamatan: string } }) {
  const data = KECAMATAN_DATA[params.kecamatan];
  if (!data) notFound();

  // Generate daftar kode gerai statis
  const geraiList = Array.from(
    { length: data.kodeSampai - data.kodeAwal + 1 },
    (_, i) => `PMK-${String(data.kodeAwal + i).padStart(3, '0')}`
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-200 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <MapPin className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Kecamatan</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{data.nama}</h1>
          <p className="text-neutral-400">
            {data.jumlahGerai} gerai KDKMP aktif • Kabupaten Pamekasan, Madura
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#121214] border border-white/5 rounded-2xl p-5">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Total Gerai</p>
            <p className="text-2xl font-bold text-white">{data.jumlahGerai}</p>
          </div>
          <div className="bg-[#121214] border border-white/5 rounded-2xl p-5">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Kode Range</p>
            <p className="text-lg font-semibold text-indigo-400 font-mono">
              PMK-{String(data.kodeAwal).padStart(3, '0')} — {String(data.kodeSampai).padStart(3, '0')}
            </p>
          </div>
        </div>

        {/* Daftar Gerai */}
        <div className="bg-[#121214] border border-white/5 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Network className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Daftar Gerai</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {geraiList.map((kode) => (
              <div
                key={kode}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.02] border border-white/5 rounded-lg"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="text-xs font-mono text-neutral-300">{kode}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SEO structured content */}
        <div className="mt-8 text-xs text-neutral-600 space-y-1">
          <p>Halaman ini di-generate secara statis saat build-time (SSG).</p>
          <p>Data terakhir diperbarui saat deployment. Untuk data real-time, gunakan Dashboard Kasir.</p>
        </div>
      </div>
    </div>
  );
}

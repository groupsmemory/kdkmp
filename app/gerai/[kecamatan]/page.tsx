/**
 * ============================================================================
 * HALAMAN pSEO/GEO STATIS PER KECAMATAN — KDKMP JASASAJA
 * ============================================================================
 * generateStaticParams() pre-render 13 halaman kecamatan saat build-time.
 * Zero runtime cost — disajikan dari CDN Edge.
 * ============================================================================
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';

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

interface PageProps {
  params: Promise<{ kecamatan: string }>;
}

// Pre-render 13 kecamatan saat build-time
export function generateStaticParams() {
  return Object.keys(KECAMATAN_DATA).map((kecamatan) => ({ kecamatan }));
}

// Metadata per halaman
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { kecamatan } = await params;
  const data = KECAMATAN_DATA[kecamatan];
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

export default async function KecamatanPage({ params }: PageProps) {
  const { kecamatan } = await params;
  const data = KECAMATAN_DATA[kecamatan];
  if (!data) notFound();

  // Generate daftar kode gerai statis
  const geraiList = Array.from(
    { length: data.kodeSampai - data.kodeAwal + 1 },
    (_, i) => `PMK-${String(data.kodeAwal + i).padStart(3, '0')}`
  );

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#0A0A0A', color: '#FFFFFF' }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Navigation */}
        <a
          href="/"
          className="inline-flex items-center gap-1 text-xs font-mono mb-8"
          style={{ color: '#666666' }}
        >
          ← Kembali ke Beranda
        </a>

        {/* Header */}
        <div className="mb-8">
          <span
            className="inline-block text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 mb-3"
            style={{ backgroundColor: '#FFFFFF', color: '#0A0A0A' }}
          >
            Kecamatan
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight">{data.nama}</h1>
          <p className="text-sm mt-2" style={{ color: '#888888' }}>
            {data.jumlahGerai} gerai KDKMP aktif • Kabupaten Pamekasan, Madura
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-5" style={{ border: '2px solid #222222' }}>
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: '#666666' }}>Total Gerai</p>
            <p className="text-2xl font-black mt-1">{data.jumlahGerai}</p>
          </div>
          <div className="p-5" style={{ border: '2px solid #222222' }}>
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: '#666666' }}>Kode Range</p>
            <p className="text-lg font-bold font-mono mt-1" style={{ color: '#6366F1' }}>
              PMK-{String(data.kodeAwal).padStart(3, '0')} — {String(data.kodeSampai).padStart(3, '0')}
            </p>
          </div>
        </div>

        {/* Daftar Gerai */}
        <div className="p-6" style={{ border: '2px solid #222222' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4">Daftar Gerai</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {geraiList.map((kode) => (
              <div
                key={kode}
                className="flex items-center gap-1.5 px-2.5 py-1.5"
                style={{ border: '1px solid #333333' }}
              >
                <span className="text-green-400 text-xs">✓</span>
                <span className="text-xs font-mono" style={{ color: '#CCCCCC' }}>{kode}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-[10px] font-mono" style={{ color: '#444444' }}>
          Halaman ini di-generate secara statis saat build-time (SSG). Zero runtime cost.
        </p>
      </div>
    </div>
  );
}

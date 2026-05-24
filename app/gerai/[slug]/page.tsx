/**
 * ============================================================================
 * HALAMAN GERAI — User-Friendly URL + SSG (Zero Runtime Cost)
 * ============================================================================
 * URL Pattern: /gerai/pademawu-majungan (kecamatan-desa)
 *
 * Strategi:
 *   - generateStaticParams() query 189 tenant dari NeonDB saat BUILD
 *   - Slug format: `${kecamatan}-${desa}` (lowercase, spasi → dash)
 *   - Setiap halaman di-compile menjadi HTML statis murni
 *   - ZERO runtime query saat perayap AI atau pengunjung mengakses
 *   - ZERO compute hours di Vercel Hobby Plan
 *
 * GEO Optimization:
 *   - JSON-LD multi-entity (Corporation + Cooperative + Store)
 *   - Next.js Metadata API untuk SearchGPT, Perplexity, Gemini
 *   - Konten informatif unik per halaman (bukan generik)
 * ============================================================================
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Pool } from '@neondatabase/serverless';
import GEOStructuredData from '@/components/GEOStructuredData';

// ═══════════════════════════════════════════════════════════════
// DATABASE (hanya saat build-time)
// ═══════════════════════════════════════════════════════════════

function getBuildPool(): Pool {
  return new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    max: 3,
  });
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Slug generation
// ═══════════════════════════════════════════════════════════════

function toSlug(subdistrict: string, village: string): string {
  return `${subdistrict}-${village}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function capitalize(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ═══════════════════════════════════════════════════════════════
// TIPE
// ═══════════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface TenantRow {
  id: string;
  name: string;
  region: string;
  subdistrict: string;
  village: string;
  latitude: number;
  longitude: number;
}

// ═══════════════════════════════════════════════════════════════
// generateStaticParams: Pre-render semua gerai saat build-time
// ═══════════════════════════════════════════════════════════════

export async function generateStaticParams() {
  const pool = getBuildPool();
  try {
    const result = await pool.query(
      `SELECT subdistrict, village FROM tenants WHERE region = 'Pamekasan' AND is_active = TRUE`
    );
    return result.rows.map((row) => ({
      slug: toSlug(row.subdistrict, row.village),
    }));
  } catch (error) {
    console.error('[Gerai pSEO] Gagal generate static params:', error);
    return [];
  } finally {
    await pool.end();
  }
}

// ═══════════════════════════════════════════════════════════════
// generateMetadata: SEO/GEO meta tags
// ═══════════════════════════════════════════════════════════════

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parts = slug.split('-');
  const kecamatan = capitalize(parts[0] || '');
  const desa = capitalize(parts.slice(1).join(' ') || '');

  const title = `Gerai KDKMP Desa ${desa}, Kecamatan ${kecamatan} — JASASAJA`;
  const description = `Informasi operasional gerai Koperasi Desa Merah Putih (KDKMP) di Desa ${desa}, Kecamatan ${kecamatan}, Kabupaten Pamekasan. POS offline-first, akuntansi SAK EP, kepatuhan Inpres 17/2025.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://jasasaja.co.id/gerai/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://jasasaja.co.id/gerai/${slug}`,
      type: 'website',
      siteName: 'JASASAJA — Platform KDKMP',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// PAGE COMPONENT (Server Component — rendered at build-time)
// ═══════════════════════════════════════════════════════════════

export default async function GeraiPage({ params }: PageProps) {
  const { slug } = await params;
  const pool = getBuildPool();

  let tenant: TenantRow | null = null;

  try {
    // Query by matching slug pattern against subdistrict + village
    const result = await pool.query(
      `SELECT id, name, region, subdistrict, village, latitude, longitude
       FROM tenants
       WHERE region = 'Pamekasan' AND is_active = TRUE`
    );

    // Find tenant whose slug matches
    tenant = result.rows.find((row) => toSlug(row.subdistrict, row.village) === slug) || null;
  } catch (error) {
    console.error('[Gerai pSEO] Database error:', error);
  } finally {
    await pool.end();
  }

  if (!tenant) {
    notFound();
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* JSON-LD Structured Data */}
      <GEOStructuredData
        tenantName={tenant.name}
        region={tenant.region}
        subdistrict={tenant.subdistrict}
        village={tenant.village}
        latitude={Number(tenant.latitude)}
        longitude={Number(tenant.longitude)}
        tenantId={tenant.id}
      />

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono mb-8" style={{ color: 'var(--text-faint)' }}>
          <a href="/" className="hover:underline">Beranda</a>
          <span>›</span>
          <a href={`/gerai/${tenant.subdistrict.toLowerCase()}`} className="hover:underline">
            {tenant.subdistrict}
          </a>
          <span>›</span>
          <span style={{ color: 'var(--text-primary)' }}>{tenant.village}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <span
            className="inline-block text-xs font-mono uppercase tracking-widest px-3 py-1 mb-4"
            style={{ backgroundColor: 'var(--bg-invert)', color: 'var(--text-invert)' }}
          >
            Gerai KDKMP Aktif
          </span>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            {tenant.name}
          </h1>
          <p className="text-sm font-mono mt-2" style={{ color: 'var(--text-muted)' }}>
            Kecamatan {tenant.subdistrict} • Kabupaten {tenant.region}
          </p>
        </header>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <InfoCard label="Kecamatan" value={tenant.subdistrict} />
          <InfoCard label="Desa" value={tenant.village} />
          <InfoCard label="Latitude" value={String(tenant.latitude)} />
          <InfoCard label="Longitude" value={String(tenant.longitude)} />
        </div>

        {/* Konten SEO/GEO */}
        <article className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <p>
            <strong>{tenant.name}</strong> merupakan unit gerai Koperasi Desa dan Kelurahan
            Merah Putih yang beroperasi di Desa {tenant.village}, Kecamatan {tenant.subdistrict},
            Kabupaten Pamekasan, Madura. Gerai ini dioperasikan di bawah binaan PT Agrinas
            Pangan Nusantara (Persero) sesuai mandat Instruksi Presiden Nomor 17 Tahun 2025.
          </p>

          <p>
            Sistem digital JASASAJA yang terpasang di gerai ini menerapkan pencatatan akuntansi
            ganda otomatis sesuai Standar Akuntansi Keuangan Entitas Privat (SAK EP) dengan
            rantai hash kriptografis SHA-256 yang menjamin imutabilitas seluruh data keuangan.
            Setiap transaksi dilindungi mekanisme idempotensi dua-fase untuk mengeliminasi
            duplikasi pencatatan di wilayah blank spot jaringan.
          </p>

          <p>
            Terminal Point-of-Sale (POS) beroperasi secara offline-first menggunakan enkripsi
            AES-GCM 256-bit pada penyimpanan lokal perangkat. Data transaksi tersinkronisasi
            otomatis ke server pusat saat koneksi internet tersedia kembali, tanpa risiko
            kehilangan atau penggandaan data.
          </p>

          <p>
            Kontribusi Pendapatan Asli Desa (PADes) minimal 20% dari Sisa Hasil Usaha (SHU)
            bersih tahunan dihitung secara transparan dan otomatis, sesuai amanat PP 11/2021
            Pasal 40 ayat (2) tentang Badan Usaha Milik Desa.
          </p>
        </article>

        {/* Fitur Gerai */}
        <div className="mt-8 p-5" style={{ border: '3px solid var(--border-primary)' }}>
          <h2 className="text-sm font-black uppercase tracking-widest mb-4">Fitur Operasional</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              'POS Offline-First (Luring Penuh)',
              'Enkripsi AES-GCM 256-bit',
              'Akuntansi SAK EP Otomatis',
              'Pembayaran QRIS & Tunai',
              'Batas Brankas Rp50 Juta (BPKP)',
              'Audit Trail Hash Chain SHA-256',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 py-1">
                <span style={{ color: 'var(--accent-success)' }}>✓</span>
                <span className="text-xs">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-4" style={{ borderTop: '2px solid var(--border-muted)' }}>
          <p className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>
            Halaman ini di-render statis saat build-time (SSG). Zero runtime cost.
            Kepatuhan: Inpres 17/2025 • SAK EP • PP 60/2008 (SPIP)
          </p>
        </footer>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4" style={{ border: '2px solid var(--border-secondary)' }}>
      <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>{label}</p>
      <p className="text-sm font-black mt-1">{value}</p>
    </div>
  );
}

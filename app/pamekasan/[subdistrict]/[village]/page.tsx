/**
 * ============================================================================
 * KDKMP JASASAJA — Programmatic SEO/GEO Landing Page (Static)
 * ============================================================================
 * Hierarki: Master Validator > Gem 3/4 > Gem 2
 *
 * Strategi:
 *   - generateStaticParams() mengambil semua 189 gerai dari NeonDB saat BUILD
 *   - Setiap halaman di-compile menjadi HTML statis murni
 *   - ZERO runtime query ke NeonDB saat perayap AI mengakses
 *   - ZERO compute hours di Vercel Hobby Plan
 *
 * GEO Optimization:
 *   - JSON-LD multi-entity (Corporation + Cooperative + Store)
 *   - Next.js Metadata API untuk SearchGPT, Perplexity, Gemini
 *   - Desain brutalistik kontras tinggi (#FFFFFF, #1A1A1A)
 *
 * Free Tier Compliance:
 *   - NeonDB hanya di-query saat `next build` (bukan runtime)
 *   - Vercel CDN menyajikan HTML statis tanpa function invocation
 * ============================================================================
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Pool } from '@neondatabase/serverless';
import GEOStructuredData from '@/components/GEOStructuredData';

// ═══════════════════════════════════════════════════════════════
// DATABASE CONNECTION (hanya digunakan saat build-time)
// ═══════════════════════════════════════════════════════════════

function getBuildPool(): Pool {
  return new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    max: 3, // Minimal koneksi untuk build — hemat NeonDB Free Tier
  });
}

// ═══════════════════════════════════════════════════════════════
// TIPE
// ═══════════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ subdistrict: string; village: string }>;
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
// generateStaticParams: Pre-render 189 halaman saat build-time
// ═══════════════════════════════════════════════════════════════

export async function generateStaticParams() {
  const pool = getBuildPool();
  try {
    const result = await pool.query(
      `SELECT LOWER(subdistrict) as subdistrict, LOWER(village) as village
       FROM tenants
       WHERE region = 'Pamekasan' AND is_active = TRUE`
    );
    return result.rows.map((row) => ({
      subdistrict: row.subdistrict,
      village: row.village,
    }));
  } catch (error) {
    console.error('[pSEO] Gagal generate static params:', error);
    return [];
  } finally {
    await pool.end();
  }
}

// ═══════════════════════════════════════════════════════════════
// generateMetadata: SEO/GEO meta tags untuk AI crawlers
// ═══════════════════════════════════════════════════════════════

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subdistrict, village } = await params;
  const cap = (s: string) => decodeURIComponent(s).replace(/\b\w/g, (c) => c.toUpperCase());
  const vName = cap(village);
  const sName = cap(subdistrict);

  const title = `KDKMP Desa ${vName}, ${sName} — Sistem Akuntansi SAK EP Terintegrasi | JASASAJA`;
  const description = `Operasional digital Koperasi Desa Merah Putih (KDKMP) Desa ${vName}, Kecamatan ${sName}, Kabupaten Pamekasan. Platform SaaS JASASAJA: POS luring-pertama, audit trail kriptografis, kepatuhan Inpres 17/2025.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://jasasaja.co.id/pamekasan/${subdistrict}/${village}`,
    },
    openGraph: {
      title,
      description,
      url: `https://jasasaja.co.id/pamekasan/${subdistrict}/${village}`,
      type: 'website',
      siteName: 'JASASAJA — Platform KDKMP',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
      },
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// PAGE COMPONENT (Server Component — rendered at build-time)
// ═══════════════════════════════════════════════════════════════

export default async function VillageLandingPage({ params }: PageProps) {
  const { subdistrict, village } = await params;
  const pool = getBuildPool();

  let tenant: TenantRow | null = null;

  try {
    const result = await pool.query(
      `SELECT id, name, region, subdistrict, village, latitude, longitude
       FROM tenants
       WHERE region = 'Pamekasan'
         AND LOWER(subdistrict) = $1
         AND LOWER(village) = $2
         AND is_active = TRUE
       LIMIT 1`,
      [decodeURIComponent(subdistrict), decodeURIComponent(village)]
    );
    tenant = result.rows[0] || null;
  } catch (error) {
    console.error('[pSEO] Database query error:', error);
  } finally {
    await pool.end();
  }

  if (!tenant) {
    notFound();
  }

  return (
    <div
      className="min-h-screen p-6 font-sans"
      style={{ backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
    >
      {/* JSON-LD Structured Data untuk AI Crawlers */}
      <GEOStructuredData
        tenantName={tenant.name}
        region={tenant.region}
        subdistrict={tenant.subdistrict}
        village={tenant.village}
        latitude={Number(tenant.latitude)}
        longitude={Number(tenant.longitude)}
        tenantId={tenant.id}
      />

      <div
        className="max-w-3xl mx-auto p-8"
        style={{ border: '8px solid #1A1A1A', boxShadow: '12px 12px 0px 0px #1A1A1A' }}
      >
        {/* Badge */}
        <span
          className="inline-block text-xs font-mono py-1 px-3 uppercase tracking-widest mb-4"
          style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }}
        >
          Pilot Project PT Agrinas — Pamekasan
        </span>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
          Sistem KDKMP Desa {tenant.village}
        </h1>
        <p className="font-mono text-sm uppercase mt-2" style={{ color: '#6B7280' }}>
          Kecamatan {tenant.subdistrict} | Lat: {tenant.latitude} Long: {tenant.longitude}
        </p>

        <hr className="my-6" style={{ borderTop: '4px solid #1A1A1A' }} />

        {/* Konten SEO/GEO */}
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Operasional digitalisasi <strong>{tenant.name}</strong> diarsitekturi oleh platform{' '}
            <strong>JASASAJA</strong> guna memenuhi standar audit BPK dan BPKP RI.
            Infrastruktur dirancang agar mampu beroperasi secara luring penuh saat terjadi
            kendala jaringan telekomunikasi seluler di wilayah perbukitan Pamekasan Utara.
          </p>

          <p>
            Sistem menerapkan pencatatan akuntansi ganda otomatis sesuai SAK EP (Standar
            Akuntansi Keuangan Entitas Privat) dengan rantai hash kriptografis SHA-256 yang
            menjamin imutabilitas data keuangan. Setiap transaksi dilindungi oleh mekanisme
            idempotensi dua-fase untuk mengeliminasi duplikasi pencatatan di wilayah blank spot.
          </p>

          <p>
            Kontribusi Pendapatan Asli Desa (PADes) minimal 20% dari SHU bersih tahunan
            dihitung secara transparan dan otomatis sesuai amanat Instruksi Presiden Nomor 17
            Tahun 2025 tentang Percepatan Pembangunan KDKMP.
          </p>
        </div>

        {/* Metadata Grid */}
        <div
          className="mt-8 grid grid-cols-2 gap-4 p-4"
          style={{ border: '4px solid #1A1A1A' }}
        >
          <div>
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: '#6B7280' }}>
              Kabupaten
            </p>
            <p className="font-black">{tenant.region}</p>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: '#6B7280' }}>
              Kecamatan
            </p>
            <p className="font-black">{tenant.subdistrict}</p>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: '#6B7280' }}>
              Desa
            </p>
            <p className="font-black">{tenant.village}</p>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: '#6B7280' }}>
              Status
            </p>
            <p className="font-black text-green-700">Operasional</p>
          </div>
        </div>

        {/* Footer Legal */}
        <p className="mt-6 text-xs" style={{ color: '#9CA3AF' }}>
          Halaman ini di-generate secara statis saat build-time (SSG). Zero runtime cost.
          Kepatuhan: Inpres 17/2025 • SAK EP • PP 60/2008 (SPIP)
        </p>
      </div>
    </div>
  );
}

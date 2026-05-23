/**
 * ============================================================================
 * HALAMAN TENTANG KAMI — JASASAJA KDKMP
 * ============================================================================
 * Static (SSG) — Zero runtime cost, GEO-optimized
 * Konten: Detail project berdasarkan riset mendalam
 * ============================================================================
 */

import { Metadata } from 'next';
import AboutContent from './about-content';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Tentang JASASAJA — Platform Digital KDKMP Koperasi Desa Merah Putih',
  description:
    'JASASAJA adalah platform SaaS manajemen operasional 189 gerai Koperasi Desa dan Kelurahan Merah Putih (KDKMP) di Kabupaten Pamekasan, Madura. Dikembangkan untuk PT Agrinas Pangan Nusantara sesuai Inpres 17/2025.',
  openGraph: {
    title: 'Tentang JASASAJA — Platform KDKMP',
    description: 'Digitalisasi penuh operasional koperasi desa dengan arsitektur offline-first dan kepatuhan audit BPKP.',
    type: 'website',
  },
};

export default function AboutPage() {
  return <AboutContent />;
}

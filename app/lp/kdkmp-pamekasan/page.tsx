/**
 * ============================================================================
 * LANDING PAGE — Meta Ads Funnel: KDKMP Pamekasan
 * ============================================================================
 * Target: Pengurus koperasi, eksekutif BUMN, kepala desa
 * Desain: Brutalistik kontras tinggi (#FFFFFF, #1A1A1A, aksen #00F2FE)
 * CTA: Langsung ke website (bukan ke profil sosmed)
 * Rendering: Static (SSG) — zero runtime cost
 *
 * Tracking: Meta Pixel PageView + Lead event saat CTA diklik
 * ============================================================================
 */

import { Metadata } from 'next';
import LandingContent from './landing-content';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'KDKMP Pamekasan — Digitalisasi 189 Koperasi Desa | JASASAJA',
  description:
    'Platform SaaS untuk 189 gerai Koperasi Desa Merah Putih di Kabupaten Pamekasan. POS offline-first, akuntansi SAK EP otomatis, audit trail kriptografis. Kepatuhan Inpres 17/2025.',
  openGraph: {
    title: 'KDKMP Pamekasan — 189 Koperasi Desa Terdigitalisasi',
    description: 'Sistem manajemen koperasi desa terintegrasi. Zero biaya infrastruktur.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function LandingPage() {
  return <LandingContent />;
}

/**
 * ============================================================================
 * HALAMAN DEVELOPER DASHBOARD — Roadmap, Progress, Checklist, Jadwal
 * ============================================================================
 * Akses: HANYA developer (dilindungi oleh DEV_SECRET_KEY di environment)
 * Rendering: Dynamic (tidak di-index, tidak statis)
 * Fungsi: Tracking progress development KDKMP JASASAJA
 * ============================================================================
 */

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import DevDashboard from './dev-dashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'DEV — KDKMP JASASAJA Development Tracker',
  robots: { index: false, follow: false },
};

export default async function DevPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  // Proteksi akses: hanya bisa diakses dengan ?key=DEV_SECRET
  // Set DEV_ACCESS_KEY di .env.local (contoh: DEV_ACCESS_KEY=rahasia123)
  const params = await searchParams;
  const expectedKey = process.env.DEV_ACCESS_KEY || 'dev';

  if (params.key !== expectedKey) {
    redirect('/');
  }

  return <DevDashboard />;
}

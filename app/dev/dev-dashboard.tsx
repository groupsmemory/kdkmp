'use client';

/**
 * ============================================================================
 * DEV DASHBOARD — Interactive Roadmap & Progress Tracker
 * ============================================================================
 * Client component dengan state persisten di localStorage.
 * Semua data checklist disimpan lokal di browser developer.
 * Tidak memakan resource server atau database.
 * ============================================================================
 */

import { useState, useEffect, useMemo, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// DATA: Fase, Task, dan Jadwal
// ═══════════════════════════════════════════════════════════════

interface Task {
  id: string;
  title: string;
  notes?: string;
}

interface Phase {
  id: string;
  title: string;
  subtitle: string;
  week: string;
  tasks: Task[];
}

const PHASES: Phase[] = [
  {
    id: 'fase-1',
    title: 'FASE 1: Foundation & Infrastructure',
    subtitle: 'Database live, auth dasar, environment siap, CI/CD jalan',
    week: 'Minggu 1-2',
    tasks: [
      { id: '1.1', title: 'Buat akun NeonDB Free + create database kdkmp', notes: 'https://console.neon.tech' },
      { id: '1.2', title: 'Jalankan db/schema.sql di NeonDB (migrasi awal)', notes: 'psql $NEON_DATABASE_URL -f db/schema.sql' },
      { id: '1.3', title: 'Verifikasi 13 tenant seed data masuk', notes: 'SELECT * FROM tenants;' },
      { id: '1.4', title: 'Buat akun Upstash Redis Free', notes: 'https://console.upstash.com' },
      { id: '1.5', title: 'Setup .env.local dari .env.example', notes: 'JANGAN commit file ini' },
      { id: '1.6', title: 'Install dependencies: npm install' },
      { id: '1.7', title: 'Verifikasi npm run build sukses tanpa error' },
      { id: '1.8', title: 'Deploy ke Vercel (connect GitHub repo)', notes: 'Set env vars di Vercel Dashboard' },
      { id: '1.9', title: 'Verifikasi deployment live + static pages accessible' },
      { id: '1.10', title: 'Setup domain custom (jasasaja.co.id)', notes: 'Opsional di fase ini' },
      { id: '1.11', title: 'Pilih auth strategy (NextAuth.js / custom JWT)', notes: 'Implementasi: Custom JWT HMAC-SHA256 + httpOnly cookie' },
      { id: '1.12', title: 'Buat tabel users + relasi ke tenants' },
      { id: '1.13', title: 'Implementasi login page (brutalist #FFFFFF/#1A1A1A)' },
      { id: '1.14', title: 'Middleware: inject app.current_tenant_id ke DB session', notes: 'Kritis untuk RLS' },
      { id: '1.15', title: 'Proteksi route /dashboard dan /pos' },
    ],
  },
  {
    id: 'fase-2',
    title: 'FASE 2: Core POS Engine — Offline-First',
    subtitle: 'Kasir bisa input transaksi luring, data terenkripsi, sync otomatis',
    week: 'Minggu 3-5',
    tasks: [
      { id: '2.1', title: 'Buat halaman /pos dengan layout POS kasir', notes: 'Brutalist, tombol 48dp' },
      { id: '2.2', title: 'Implementasi Dexie.js encrypted store', notes: 'lib/dexieStore.ts sudah ada' },
      { id: '2.3', title: 'Form input transaksi (item, qty, harga, metode bayar)' },
      { id: '2.4', title: 'Generate idempotencyKey (UUID v4) per transaksi' },
      { id: '2.5', title: 'Simpan transaksi ke IndexedDB terenkripsi' },
      { id: '2.6', title: 'Buat API route /api/v1/pos/transaction' },
      { id: '2.7', title: 'Implementasi auto-sync saat online (setupAutoSync)' },
      { id: '2.8', title: 'Tampilkan indikator status sync (online/offline/syncing)' },
      { id: '2.9', title: 'Integrasi POSLockout.tsx (Zustand cash tracking)', notes: 'Komponen sudah ada' },
      { id: '2.10', title: 'TEST: input offline → matikan wifi → nyalakan → verifikasi sync' },
      { id: '2.11', title: 'Buat halaman /pos/tutup-buku' },
      { id: '2.12', title: 'Agregasi total kas dari transaksi hari ini' },
      { id: '2.13', title: 'Buat API route /api/v1/pos/daily-closing' },
      { id: '2.14', title: 'Verifikasi trigger SAK EP berjalan (cek ledger_entries)' },
      { id: '2.15', title: 'Verifikasi hash chain integrity per tenant' },
    ],
  },
  {
    id: 'fase-3',
    title: 'FASE 3: Akuntansi & Laporan SAK EP',
    subtitle: 'Laporan keuangan otomatis, neraca, laba rugi',
    week: 'Minggu 5-7',
    tasks: [
      { id: '3.1', title: 'Buat halaman /laporan/neraca' },
      { id: '3.2', title: 'Buat halaman /laporan/laba-rugi' },
      { id: '3.3', title: 'Buat halaman /laporan/jurnal-umum' },
      { id: '3.4', title: 'Implementasi filter per periode (bulan/tahun)' },
      { id: '3.5', title: 'Buat halaman /laporan/shu-pades', notes: 'Kalkulasi SHU + PADes 20%' },
      { id: '3.6', title: 'Export laporan ke PDF (react-pdf)', notes: 'Opsional' },
      { id: '3.7', title: 'Fungsi verifikasi integritas hash chain (audit)' },
    ],
  },
  {
    id: 'fase-4',
    title: 'FASE 4: Payment Gateway Xendit',
    subtitle: 'Terima pembayaran QRIS/VA, webhook aman dari double top-up',
    week: 'Minggu 7-8',
    tasks: [
      { id: '4.1', title: 'Buat akun Xendit + dapatkan callback token', notes: 'https://dashboard.xendit.co' },
      { id: '4.2', title: 'Verifikasi webhook route di Xendit dashboard', notes: 'Route sudah ada' },
      { id: '4.3', title: 'Buat API route /api/v1/pos/create-payment (Xendit Invoice)' },
      { id: '4.4', title: 'Integrasi QRIS di halaman POS (tampilkan QR)' },
      { id: '4.5', title: 'TEST: bayar QRIS → webhook → transaksi tercatat' },
      { id: '4.6', title: 'TEST: webhook duplikat → verifikasi no double entry' },
    ],
  },
  {
    id: 'fase-5',
    title: 'FASE 5: Programmatic SEO & GEO',
    subtitle: '189 halaman statis live, JSON-LD terindeks AI crawlers',
    week: 'Minggu 8-9',
    tasks: [
      { id: '5.1', title: 'Seed 189 tenant lengkap ke NeonDB', notes: 'Expand dari 13 seed' },
      { id: '5.2', title: 'Verifikasi generateStaticParams() → 189 paths', notes: 'npm run build' },
      { id: '5.3', title: 'Verifikasi JSON-LD valid (Google Rich Results Test)' },
      { id: '5.4', title: 'Submit sitemap ke Google Search Console' },
      { id: '5.5', title: 'Submit sitemap ke Bing Webmaster Tools' },
      { id: '5.6', title: 'Verifikasi indexing (site:jasasaja.co.id)', notes: 'Tunggu 1-2 minggu' },
      { id: '5.7', title: 'TEST: tanya Perplexity/Gemini tentang KDKMP Pamekasan' },
    ],
  },
  {
    id: 'fase-6',
    title: 'FASE 6: Meta Ads & CAPI',
    subtitle: 'Funnel iklan aktif, konversi terlacak server-side',
    week: 'Minggu 9-10',
    tasks: [
      { id: '6.1', title: 'Setup Meta Pixel di halaman publik' },
      { id: '6.2', title: 'Integrasi client → CAPI (event_id sama)', notes: 'Deduplikasi otomatis' },
      { id: '6.3', title: 'Buat landing page /lp/kdkmp-pamekasan', notes: 'Brutalist, CTA jelas' },
      { id: '6.4', title: 'Setup kampanye Meta Ads', notes: 'Target: pengurus koperasi, BUMN' },
      { id: '6.5', title: 'Verifikasi event di Meta Events Manager' },
    ],
  },
  {
    id: 'fase-7',
    title: 'FASE 7: Fitur Lanjutan & Soft Launch',
    subtitle: 'Modul pertanian, kredit saprotan, dashboard eksekutif',
    week: 'Minggu 10-14',
    tasks: [
      { id: '7.1', title: 'Modul pendaftaran anggota petani (CRUD farmers)' },
      { id: '7.2', title: 'Modul kredit saprotan tertutup (closed-loop)' },
      { id: '7.3', title: 'Modul pencatatan hasil bumi (tembakau/garam)' },
      { id: '7.4', title: 'Integrasi API i-Pubers (kuota pupuk)', notes: 'Jika API tersedia' },
      { id: '7.5', title: 'Dashboard eksekutif PT Agrinas (dark theme)' },
      { id: '7.6', title: 'Peta spasial gerai (Leaflet/Mapbox)' },
      { id: '7.7', title: 'Soft launch 35 gerai pertama' },
    ],
  },
];

const STORAGE_KEY = 'kdkmp_dev_progress';
const NOTES_KEY = 'kdkmp_dev_notes';

// Tasks yang sudah selesai berdasarkan implementasi aktual
const DEFAULT_COMPLETED: Record<string, boolean> = {
  // Fase 1: Foundation & Infrastructure
  '1.1': true,  // NeonDB Free created
  '1.2': true,  // schema.sql dijalankan
  '1.3': true,  // 13 tenant seed verified
  '1.4': true,  // Upstash Redis Free created
  '1.5': true,  // .env.local setup
  '1.6': true,  // npm install
  '1.7': true,  // npm run build sukses
  '1.8': true,  // Deploy ke Vercel
  '1.9': true,  // Deployment live verified
  '1.11': true, // Auth strategy: Custom JWT httpOnly cookie
  '1.12': true, // Tabel users + relasi tenants (migration 001)
  '1.13': true, // Login page brutalist + dark/light mode
  '1.14': true, // Middleware: set_config tenant_id via session JWT
  '1.15': true, // Proteksi route /dashboard dan /pos
  // Fase 2: Core POS Engine
  '2.1': true,  // Halaman /pos dengan layout kasir
  '2.2': true,  // Dexie.js encrypted store (AES-GCM 256-bit)
  '2.3': true,  // Form input transaksi (katalog, qty, metode bayar)
  '2.4': true,  // Generate idempotencyKey UUID v4
  '2.5': true,  // Simpan ke IndexedDB terenkripsi
  '2.6': true,  // API route /api/v1/pos/transaction
  '2.7': true,  // Auto-sync saat online (setupAutoSync)
  '2.8': true,  // Indikator status sync (online/offline/syncing)
  '2.9': true,  // POSLockout.tsx Zustand cash tracking
  '2.11': true, // Halaman /pos/tutup-buku
  '2.12': true, // Agregasi total kas hari ini
  '2.13': true, // API route /api/v1/pos/daily-closing
  // Fase 3: Akuntansi & Laporan
  '3.1': true,  // Halaman /laporan/neraca
  '3.2': true,  // Halaman /laporan/laba-rugi
  '3.3': true,  // Halaman /laporan/jurnal-umum
  '3.4': true,  // Filter per periode (bulan/tahun)
  '3.5': true,  // Kalkulator SHU & PADes (halaman terpisah)
};

// ═══════════════════════════════════════════════════════════════
// KOMPONEN UTAMA
// ═══════════════════════════════════════════════════════════════

export default function DevDashboard() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [dailyNotes, setDailyNotes] = useState('');
  const [activePhase, setActivePhase] = useState('fase-1');
  const [mounted, setMounted] = useState(false);

  // Load dari localStorage (merge dengan default completed)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge: default completed + user overrides
      setCompleted({ ...DEFAULT_COMPLETED, ...parsed });
    } else {
      setCompleted(DEFAULT_COMPLETED);
    }
    const notes = localStorage.getItem(NOTES_KEY);
    if (notes) setDailyNotes(notes);
    setMounted(true);
  }, []);

  // Save ke localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    }
  }, [completed, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(NOTES_KEY, dailyNotes);
    }
  }, [dailyNotes, mounted]);

  const toggleTask = useCallback((taskId: string) => {
    setCompleted((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  }, []);

  // Statistik
  const stats = useMemo(() => {
    const totalTasks = PHASES.reduce((sum, p) => sum + p.tasks.length, 0);
    const completedTasks = Object.values(completed).filter(Boolean).length;
    const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const phaseStats = PHASES.map((phase) => {
      const phaseCompleted = phase.tasks.filter((t) => completed[t.id]).length;
      return {
        id: phase.id,
        total: phase.tasks.length,
        done: phaseCompleted,
        percent: phase.tasks.length > 0 ? Math.round((phaseCompleted / phase.tasks.length) * 100) : 0,
      };
    });

    return { totalTasks, completedTasks, percent, phaseStats };
  }, [completed]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }}>
        <p className="font-mono text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#0D0D0D', color: '#E5E5E5' }}>
      {/* Header */}
      <header className="border-b border-neutral-800 px-4 py-6 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-red-600 text-white">
              PRIVATE
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-neutral-800 text-neutral-400">
              Developer Only
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            KDKMP JASASAJA — Dev Tracker
          </h1>
          <p className="text-sm text-neutral-500 mt-1 font-mono">
            Progress: {stats.completedTasks}/{stats.totalTasks} tasks ({stats.percent}%)
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {/* Progress Bar Global */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
              Overall Progress
            </span>
            <span className="text-sm font-mono font-bold text-white">{stats.percent}%</span>
          </div>
          <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${stats.percent}%`,
                backgroundColor: stats.percent === 100 ? '#10B981' : '#6366F1',
              }}
            />
          </div>
        </div>

        {/* Phase Progress Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {stats.phaseStats.map((ps, i) => (
            <button
              key={ps.id}
              onClick={() => setActivePhase(ps.id)}
              className={`p-3 text-left rounded-lg border transition-all cursor-pointer ${
                activePhase === ps.id
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
              }`}
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                Fase {i + 1}
              </p>
              <p className="text-lg font-bold text-white">{ps.done}/{ps.total}</p>
              <div className="h-1.5 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${ps.percent}%`,
                    backgroundColor: ps.percent === 100 ? '#10B981' : '#6366F1',
                  }}
                />
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checklist Panel */}
          <div className="lg:col-span-2">
            {PHASES.filter((p) => p.id === activePhase).map((phase) => (
              <div key={phase.id}>
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white">{phase.title}</h2>
                  <p className="text-sm text-neutral-500">{phase.subtitle}</p>
                  <p className="text-xs font-mono text-indigo-400 mt-1">{phase.week}</p>
                </div>

                <div className="space-y-2">
                  {phase.tasks.map((task) => (
                    <label
                      key={task.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        completed[task.id]
                          ? 'border-green-800/50 bg-green-900/10'
                          : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!completed[task.id]}
                        onChange={() => toggleTask(task.id)}
                        className="mt-0.5 w-5 h-5 rounded border-2 border-neutral-600 bg-transparent accent-green-500 cursor-pointer flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            completed[task.id] ? 'line-through text-neutral-600' : 'text-neutral-200'
                          }`}
                        >
                          <span className="font-mono text-xs text-neutral-600 mr-2">[{task.id}]</span>
                          {task.title}
                        </p>
                        {task.notes && (
                          <p className="text-xs text-neutral-600 mt-0.5 font-mono">{task.notes}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar: Daily Notes + Quick Info */}
          <div className="space-y-6">
            {/* Daily Notes */}
            <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-900">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Catatan Harian
              </h3>
              <textarea
                value={dailyNotes}
                onChange={(e) => setDailyNotes(e.target.value)}
                placeholder={"Target hari ini:\n- ...\n\nBlocker:\n- ...\n\nCatatan:\n- ..."}
                className="w-full h-48 p-3 text-sm font-mono bg-neutral-950 border border-neutral-800 rounded text-neutral-300 placeholder:text-neutral-700 resize-none focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-neutral-700 mt-2 font-mono">
                Auto-saved ke localStorage
              </p>
            </div>

            {/* Jadwal Mingguan */}
            <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-900">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Jadwal Mingguan
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { w: '1-2', f: 'Infra + Auth' },
                  { w: '3-4', f: 'POS Offline + Sync' },
                  { w: '5', f: 'Daily Closing + Trigger' },
                  { w: '6-7', f: 'Laporan SAK EP' },
                  { w: '7-8', f: 'Xendit Payment' },
                  { w: '8-9', f: 'pSEO 189 Pages' },
                  { w: '9-10', f: 'Meta Ads + CAPI' },
                  { w: '10-14', f: 'Fitur Lanjutan + Launch' },
                ].map((item) => (
                  <div key={item.w} className="flex justify-between items-center py-1 border-b border-neutral-800 last:border-0">
                    <span className="font-mono text-neutral-500">W{item.w}</span>
                    <span className="text-neutral-300">{item.f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Commands */}
            <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-900">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Quick Commands
              </h3>
              <div className="space-y-2">
                {[
                  'npm run dev',
                  'npm run build',
                  'npm run lint',
                  'psql $NEON_DATABASE_URL -f db/schema.sql',
                  'git push origin main',
                ].map((cmd) => (
                  <code
                    key={cmd}
                    className="block text-xs font-mono p-2 bg-neutral-950 border border-neutral-800 rounded text-green-400 select-all"
                  >
                    {cmd}
                  </code>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                if (confirm('Reset SEMUA progress? Tidak bisa di-undo.')) {
                  setCompleted({});
                  setDailyNotes('');
                  localStorage.removeItem(STORAGE_KEY);
                  localStorage.removeItem(NOTES_KEY);
                }
              }}
              className="w-full p-3 text-xs font-mono uppercase tracking-widest text-red-500 border border-red-900/50 rounded-lg hover:bg-red-900/10 transition-colors cursor-pointer"
            >
              Reset All Progress
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-800 px-4 py-4 mt-12 text-center">
        <p className="text-[10px] font-mono text-neutral-700">
          KDKMP JASASAJA Dev Tracker • Data tersimpan di localStorage browser ini • Tidak dikirim ke server
        </p>
      </footer>
    </div>
  );
}

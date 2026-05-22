# KDKMP JASASAJA — Roadmap & Development Tracker

> **Developer**: Solo Developer (Anda)
> **Tanggal Mulai**: 22 Mei 2026
> **Target MVP Live**: Agustus 2026
> **Stack**: Next.js 15 + Tailwind v4 + NeonDB + Upstash + Xendit + Zustand + Dexie.js
> **Hosting**: Vercel Hobby (FREE) → Upgrade ke Pro saat revenue masuk

---

## Status Legend

- ⬜ Belum dimulai
- 🔄 Sedang dikerjakan
- ✅ Selesai
- 🚫 Diblokir (ada dependency)
- 🧪 Perlu testing

---

## FASE 1: Foundation & Infrastructure (Minggu 1-2)

> Tujuan: Database live, auth dasar, environment siap, CI/CD jalan.

### Checklist Infrastruktur

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 1.1 | Buat akun NeonDB Free + create database `kdkmp` | ⬜ | https://console.neon.tech |
| 1.2 | Jalankan `db/schema.sql` di NeonDB (migrasi awal) | ⬜ | `psql $NEON_DATABASE_URL -f db/schema.sql` |
| 1.3 | Verifikasi 13 tenant seed data masuk | ⬜ | `SELECT * FROM tenants;` |
| 1.4 | Buat akun Upstash Redis Free | ⬜ | https://console.upstash.com |
| 1.5 | Setup `.env.local` dari `.env.example` | ⬜ | JANGAN commit file ini |
| 1.6 | Install dependencies: `npm install` | ⬜ | Pastikan `@neondatabase/serverless`, `dexie`, `zustand` |
| 1.7 | Verifikasi `npm run build` sukses tanpa error | ⬜ | |
| 1.8 | Deploy ke Vercel (connect GitHub repo) | ⬜ | Set env vars di Vercel Dashboard |
| 1.9 | Verifikasi deployment live + static pages accessible | ⬜ | |
| 1.10 | Setup domain custom (jasasaja.co.id) jika sudah ada | ⬜ | Opsional di fase ini |

### Checklist Auth & Session

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 1.11 | Pilih auth strategy (NextAuth.js / Clerk / custom JWT) | ⬜ | Rekomendasi: NextAuth.js + credentials provider |
| 1.12 | Buat tabel `users` + relasi ke `tenants` | ⬜ | Tambah di schema.sql |
| 1.13 | Implementasi login page (brutalist, #FFFFFF/#1A1A1A) | ⬜ | |
| 1.14 | Middleware: inject `app.current_tenant_id` ke DB session | ⬜ | Kritis untuk RLS |
| 1.15 | Proteksi route `/dashboard` dan `/pos` (redirect jika belum login) | ⬜ | |

---

## FASE 2: Core POS Engine — Offline-First (Minggu 3-5)

> Tujuan: Kasir bisa input transaksi luring, data terenkripsi, sync otomatis.

### Checklist POS

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 2.1 | Buat halaman `/pos` dengan layout POS kasir | ⬜ | Brutalist, tombol 48dp |
| 2.2 | Implementasi Dexie.js store (`lib/dexieStore.ts` sudah ada) | ⬜ | Verifikasi enkripsi AES-GCM |
| 2.3 | Buat form input transaksi (item, qty, harga, metode bayar) | ⬜ | `inputMode="numeric"` |
| 2.4 | Generate `idempotencyKey` (UUID v4) per transaksi | ⬜ | `crypto.randomUUID()` |
| 2.5 | Simpan transaksi ke IndexedDB terenkripsi | ⬜ | |
| 2.6 | Buat API route `/api/v1/pos/transaction` | ⬜ | INSERT ke `transactions` + trigger ledger |
| 2.7 | Implementasi auto-sync saat online (`setupAutoSync`) | ⬜ | Event listener `online` |
| 2.8 | Tampilkan indikator status sync (online/offline/syncing) | ⬜ | |
| 2.9 | Integrasi POSLockout.tsx (Zustand cash tracking) | ⬜ | Komponen sudah ada |
| 2.10 | Test: input transaksi offline → matikan wifi → nyalakan → verifikasi sync | 🧪 | |

### Checklist Penutupan Harian

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 2.11 | Buat halaman `/pos/tutup-buku` | ⬜ | |
| 2.12 | Agregasi total kas dari transaksi hari ini | ⬜ | Dari IndexedDB + server |
| 2.13 | Buat API route `/api/v1/pos/daily-closing` | ⬜ | INSERT ke `daily_closings` → trigger SAK EP |
| 2.14 | Verifikasi trigger `generate_sak_ep_journal_entries()` berjalan | 🧪 | Cek `ledger_entries` terisi |
| 2.15 | Verifikasi hash chain integrity per tenant | 🧪 | |

---

## FASE 3: Akuntansi & Laporan SAK EP (Minggu 5-7)

> Tujuan: Laporan keuangan otomatis, neraca, laba rugi.

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 3.1 | Buat halaman `/laporan/neraca` | ⬜ | Query dari `ledger_entries` |
| 3.2 | Buat halaman `/laporan/laba-rugi` | ⬜ | Agregasi REVENUE - EXPENSE |
| 3.3 | Buat halaman `/laporan/jurnal-umum` | ⬜ | List semua ledger entries |
| 3.4 | Implementasi filter per periode (bulan/tahun) | ⬜ | |
| 3.5 | Buat halaman `/laporan/shu-pades` | ⬜ | Kalkulasi SHU + PADes 20% |
| 3.6 | Export laporan ke PDF (opsional, bisa pakai react-pdf) | ⬜ | Fase lanjutan |
| 3.7 | Verifikasi integritas hash chain (fungsi audit) | ⬜ | |

---

## FASE 4: Payment Gateway Xendit (Minggu 7-8)

> Tujuan: Terima pembayaran QRIS/VA, webhook aman dari double top-up.

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 4.1 | Buat akun Xendit + dapatkan callback token | ⬜ | https://dashboard.xendit.co |
| 4.2 | Webhook route sudah ada (`/api/v1/webhook/xendit`) | ✅ | Verifikasi di Xendit dashboard |
| 4.3 | Buat API route `/api/v1/pos/create-payment` (generate invoice) | ⬜ | Xendit Invoice API |
| 4.4 | Integrasi QRIS di halaman POS | ⬜ | Tampilkan QR code |
| 4.5 | Test: bayar via QRIS → webhook masuk → transaksi tercatat | 🧪 | |
| 4.6 | Test: kirim webhook duplikat → verifikasi tidak ada double entry | 🧪 | |

---

## FASE 5: Programmatic SEO & GEO (Minggu 8-9)

> Tujuan: 189 halaman statis live, JSON-LD terindeks AI crawlers.

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 5.1 | Seed 189 tenant lengkap ke NeonDB (semua desa Pamekasan) | ⬜ | Expand dari 13 seed |
| 5.2 | Halaman pSEO sudah ada (`/pamekasan/[subdistrict]/[village]`) | ✅ | |
| 5.3 | Verifikasi `generateStaticParams()` menghasilkan 189 paths | 🧪 | `npm run build` |
| 5.4 | Verifikasi JSON-LD valid (Google Rich Results Test) | 🧪 | |
| 5.5 | Submit sitemap ke Google Search Console | ⬜ | |
| 5.6 | Submit sitemap ke Bing Webmaster Tools | ⬜ | |
| 5.7 | Verifikasi halaman terindeks di Google (site:jasasaja.co.id) | 🧪 | Tunggu 1-2 minggu |
| 5.8 | Test: tanya Perplexity/Gemini tentang "KDKMP Pamekasan" | 🧪 | |

---

## FASE 6: Meta Ads & CAPI (Minggu 9-10)

> Tujuan: Funnel iklan aktif, konversi terlacak server-side.

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 6.1 | Setup Meta Pixel di halaman publik | ⬜ | Client-side pixel |
| 6.2 | Route CAPI sudah ada (`/api/v1/meta-capi`) | ✅ | |
| 6.3 | Integrasi client → CAPI (kirim event dengan event_id sama) | ⬜ | Deduplikasi otomatis |
| 6.4 | Buat landing page khusus Meta Ads (`/lp/kdkmp-pamekasan`) | ⬜ | Brutalist, CTA jelas |
| 6.5 | Setup kampanye Meta Ads (targeting: pengurus koperasi, BUMN) | ⬜ | |
| 6.6 | Verifikasi event masuk di Meta Events Manager | 🧪 | |

---

## FASE 7: Fitur Lanjutan (Minggu 10-14)

> Tujuan: Modul pertanian, kredit saprotan, dashboard eksekutif.

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 7.1 | Modul pendaftaran anggota petani (CRUD `farmers`) | ⬜ | |
| 7.2 | Modul kredit saprotan tertutup (closed-loop) | ⬜ | |
| 7.3 | Modul pencatatan hasil bumi (tembakau/garam) | ⬜ | `crop_sales` |
| 7.4 | Integrasi API i-Pubers (kuota pupuk subsidi) | ⬜ | Jika API tersedia |
| 7.5 | Dashboard eksekutif PT Agrinas (dark theme, #121212/#00F2FE) | ⬜ | |
| 7.6 | Peta spasial gerai (Leaflet/Mapbox) | ⬜ | |
| 7.7 | Modul e-commerce B2C + RajaOngkir | ⬜ | Fase 3 roadmap produk |

---

## TUGAS HARIAN (Template)

Salin dan isi setiap hari kerja:

```
### Tanggal: [YYYY-MM-DD]

**Target hari ini:**
- [ ] ...
- [ ] ...
- [ ] ...

**Selesai:**
- [x] ...

**Blocker:**
- ...

**Catatan:**
- ...
```

---

## JADWAL MINGGUAN

| Minggu | Fokus | Deliverable |
|--------|-------|-------------|
| 1 | Infra + Environment | NeonDB live, Vercel deployed, env configured |
| 2 | Auth + RLS | Login works, tenant isolation verified |
| 3 | POS UI + Offline Store | Transaksi bisa diinput offline |
| 4 | POS Sync + Lockout | Auto-sync works, lockout Rp50jt aktif |
| 5 | Daily Closing + Trigger | Tutup buku → jurnal SAK EP otomatis |
| 6 | Laporan Keuangan | Neraca, laba rugi, jurnal umum |
| 7 | Xendit Integration | QRIS payment live, webhook aman |
| 8 | pSEO Build | 189 halaman statis, sitemap submitted |
| 9 | Meta Ads Setup | Pixel + CAPI + kampanye pertama |
| 10 | Modul Petani | Pendaftaran, kredit, crop sales |
| 11-12 | Polish + Testing | Bug fixes, performance, accessibility |
| 13-14 | Soft Launch | 35 gerai pertama live |

---

## TUTORIAL STEP-BY-STEP

### Step 1: Setup Environment Lokal

```bash
# Clone repo
git clone https://github.com/[username]/kdkmp.git
cd kdkmp

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local dengan credentials asli (NeonDB, Upstash, dll)

# Jalankan development server
npm run dev
```

### Step 2: Setup NeonDB

1. Buka https://console.neon.tech → Create Project → nama: `kdkmp`
2. Copy connection string ke `.env.local` (`NEON_DATABASE_URL`)
3. Buka SQL Editor di Neon Console
4. Paste seluruh isi `db/schema.sql` → Execute
5. Verifikasi: `SELECT count(*) FROM tenants;` → harus 13

### Step 3: Setup Upstash Redis

1. Buka https://console.upstash.com → Create Database → region: Singapore
2. Copy REST URL dan Token ke `.env.local`
3. Verifikasi: `npm run build` → middleware tidak error

### Step 4: Verifikasi Build

```bash
# Build production
npm run build

# Cek output:
# - Static pages generated (/, /kalkulator-shu, /pamekasan/*)
# - API routes compiled
# - No TypeScript errors
```

### Step 5: Deploy ke Vercel

1. Push ke GitHub
2. Buka https://vercel.com → Import Repository
3. Set Environment Variables (copy dari .env.local)
4. Deploy → verifikasi URL live

### Step 6: Mulai Development Fitur

Ikuti checklist FASE 2 ke atas secara berurutan. Setiap task yang selesai, update status di file ini.

---

## PRINSIP DEVELOPMENT

1. **Satu fitur per branch** — `feat/pos-offline`, `feat/xendit-webhook`, dll.
2. **Test sebelum merge** — Minimal manual test di browser + `npm run build` sukses.
3. **Commit atomic** — Satu commit = satu perubahan logis yang utuh.
4. **Steering rules adalah hukum** — Jangan melanggar aturan di `.kiro/steering/`.
5. **Free tier first** — Selalu tanya: "Apakah ini memakan compute/storage/bandwidth?"
6. **Offline-first mindset** — Setiap fitur kasir harus bisa jalan tanpa internet.
7. **Security by default** — Enkripsi, validasi, sanitasi di setiap layer.

---

## METRIK KEBERHASILAN MVP

| Metrik | Target | Cara Ukur |
|--------|--------|-----------|
| Build sukses | 0 error | `npm run build` |
| Halaman statis | 189+ pages | Build output log |
| Lighthouse Score | > 90 (Performance) | Chrome DevTools |
| Offline POS | Bisa input tanpa internet | Manual test |
| Hash chain valid | 100% integrity | Query verifikasi di DB |
| Webhook idempoten | 0 double entry | Kirim webhook duplikat |
| Free tier compliance | Rp0/bulan | Vercel + Neon + Upstash dashboard |

---

*File ini adalah dokumen hidup. Update status checklist setiap kali menyelesaikan task.*

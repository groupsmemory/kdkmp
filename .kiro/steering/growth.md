---
inclusion: always
---

# Aturan Optimasi GEO/SEO & Ads Funnel — KDKMP JASASAJA

## Hierarki Kebenaran

Instruksi Master Validator dan implementasi Gem 3/4 WAJIB menang atas draf awal Gem 2 dalam segala kontradiksi arsitektural.

## 1. Preservasi Sumber Daya via Static Site Generation (SSG)

- Seluruh halaman publik programmatic SEO dengan pola URL spasial `/pamekasan/[subdistrict]/[village]` WAJIB di-render sebagai HTML statis murni saat build-time menggunakan `generateStaticParams()`.
- Halaman statis DILARANG memicu query runtime ke NeonDB Free Tier saat diakses oleh perayap AI atau pengunjung.
- Query ke database HANYA boleh terjadi saat proses `next build` — bukan saat runtime request.
- Implikasi: compute hours Vercel Hobby Plan tetap NOL selama lonjakan traffic pencarian organik atau crawling AI.
- Halaman landing publik (`/`, `/kalkulator-shu`) WAJIB menggunakan `export const dynamic = 'force-static'` atau `generateStaticParams()`.
- Halaman interaktif kasir (`/dashboard`, `/pos`) boleh tetap dynamic karena dilindungi rate limiting dan idempotensi.

## 2. GEO Indexing via JSON-LD Structured Data

- Setiap halaman pSEO publik WAJIB menyisipkan komponen `<GEOStructuredData />` yang menghasilkan JSON-LD schema.org.
- JSON-LD WAJIB menggabungkan multi-type entity dalam satu `@graph`:
  - `Corporation` — PT Agrinas Pangan Nusantara (Persero)
  - `Cooperative` — KDKMP unit desa (dengan `parentOrganization` ke Corporation)
  - `Store` — Gerai retail fisik (dengan `branchOf` ke Cooperative)
- Setiap entitas WAJIB memiliki `@id` yang unik dan konsisten (format URL canonical).
- Koordinat geospasial (`GeoCoordinates`) WAJIB disertakan untuk entitas Cooperative dan Store.
- Sanitasi XSS WAJIB diterapkan pada output `JSON.stringify()`:
  - Replace `<` dengan `\\u003c`
  - Replace `>` dengan `\\u003e`
  - Replace `&` dengan `\\u0026`
- DILARANG menggunakan `dangerouslySetInnerHTML` tanpa sanitasi pada JSON-LD.

## 3. Next.js Metadata API untuk AI Search Engines

- Setiap halaman pSEO WAJIB mengimplementasikan `generateMetadata()` yang menghasilkan:
  - `title` — mengandung nama desa, kecamatan, dan keyword "KDKMP" / "SAK EP" / "JASASAJA"
  - `description` — deskripsi unik per halaman (bukan duplikat)
  - `alternates.canonical` — URL canonical absolut
  - `openGraph` — title, description, url, type, siteName
  - `robots` — index: true, follow: true, max-snippet: -1, max-image-preview: large
- Target keyword untuk AI crawlers: "KDKMP", "Koperasi Desa Merah Putih", "SAK EP", "Inpres 17/2025", "Pamekasan", nama kecamatan, nama desa.
- DILARANG menggunakan metadata generik atau duplikat antar halaman.

## 4. Meta Conversions API (CAPI) — Hemat Sumber Daya

- Route handler `/api/v1/meta-capi` WAJIB memproses event konversi server-side.
- PII (email, nomor telepon) WAJIB di-hash menggunakan SHA-256 sebelum dikirim ke Meta Graph API.
- Pemanggilan `fetch()` ke Meta Graph API WAJIB dikemas dalam `waitUntil()`:
  - Response HTTP 202 Accepted dikembalikan ke client SEGERA (< 50ms).
  - Graph API call berjalan di background SETELAH response terkirim.
  - Billing Vercel BERHENTI setelah response dikirim — Graph API call GRATIS.
- Jika `waitUntil()` tidak tersedia (local development): gunakan fire-and-forget pattern (`.catch()` tanpa await).
- Deduplikasi event: gunakan `event_id` yang sama antara client-side Meta Pixel dan server-side CAPI.
- DILARANG melakukan `await` pada Graph API fetch di dalam handler utama — ini akan memblokir response dan memakan compute time.

## 5. Skalabilitas XML Sitemap

- Sitemap WAJIB di-generate menggunakan Next.js `MetadataRoute['sitemap']`.
- Query database WAJIB menggunakan mekanisme batching/chunking:
  - Batch size: **5.000 routes** per query (LIMIT/OFFSET)
  - Alasan: mencegah timeout pada Vercel Hobby Plan (10 detik) saat platform berkembang ke 30.000 gerai nasional
- Saat ini (189 gerai): single batch sudah cukup, tapi arsitektur WAJIB siap untuk pagination.
- Static routes (/, /kalkulator-shu, /dashboard) WAJIB disertakan dengan priority 1.0 atau 0.8.
- Dynamic routes (per gerai) WAJIB memiliki `changeFrequency: 'weekly'` dan `priority: 0.8`.
- Koneksi database untuk sitemap: `max: 2` (minimal) dan WAJIB di-close setelah selesai (`pool.end()`).

## 6. Larangan Pertumbuhan Organik Media Sosial

- DILARANG mengintegrasikan hook, widget, atau SDK media sosial organik (Instagram embed, Twitter feed, TikTok pixel, dll).
- Pertumbuhan WAJIB murni mengandalkan:
  1. **SEO** — Programmatic static pages dengan metadata teroptimasi
  2. **GEO** — JSON-LD structured data untuk AI search engines (Gemini, Perplexity, SearchGPT)
  3. **Paid Meta Ads** — Landing page funnel langsung ke website (bukan ke profil sosmed)
- Alasan strategis: zero organic social media overhead — semua budget dan effort difokuskan pada konversi langsung.
- Desain iklan Meta Ads WAJIB menggunakan visual brutalistik kontras tinggi (#FFFFFF, #1A1A1A, aksen #00F2FE) untuk menarik perhatian eksekutif BUMN.

## 7. Konten pSEO untuk Kepercayaan AI Search

- Setiap halaman gerai WAJIB menyertakan konten tekstual yang menyebutkan:
  - Kepatuhan Inpres 17/2025
  - Standar akuntansi SAK EP
  - Rantai hash kriptografis SHA-256
  - Mekanisme idempotensi untuk wilayah blank spot
  - Kontribusi PADes minimal 20% dari SHU bersih
- Konten WAJIB ditulis dalam bahasa Indonesia formal yang akurat secara faktual.
- DILARANG menggunakan konten generik atau lorem ipsum — setiap halaman harus memiliki nilai informasi unik.
- Transparansi formula legal (SHU, PADes) meningkatkan skor kepercayaan pada AI Search Engine.

## 8. Free Tier Compliance (Vercel Hobby)

- Batas: 100GB bandwidth/bulan, 10s function timeout, 1000 build minutes/bulan.
- Halaman statis: ZERO function invocation (disajikan dari CDN Edge).
- Halaman dynamic (/api/*): dilindungi rate limiting untuk mencegah abuse.
- Build time: optimasi dengan `max: 2-3` koneksi database saat generateStaticParams.
- DILARANG menggunakan ISR dengan revalidate interval pendek (< 1 jam) pada halaman pSEO — gunakan full SSG.

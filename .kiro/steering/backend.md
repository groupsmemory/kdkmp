---
inclusion: always
---

# Aturan Backend & Middleware Edge — KDKMP JASASAJA

## Hierarki Kebenaran

Instruksi Master Validator dan implementasi Gem 3/4 WAJIB menang atas draf awal Gem 2 dalam segala kontradiksi arsitektural.

## 1. Mekanisme Idempotensi Dua-Fase (Upstash Redis)

- Setiap write request (POST, PUT, PATCH) ke endpoint `/api/v1/*` yang menyertakan header `x-idempotency-key` (format UUID v4) WAJIB diproses melalui siklus hidup dua-fase di Edge Middleware.
- **Fase 1 — PENDING (Inisiasi)**:
  - Jika kunci belum terdaftar di Upstash Redis: set status `PENDING` dengan TTL 30 detik.
  - TTL 30 detik dipilih untuk mengakomodasi latensi jaringan 3G di wilayah perbukitan Pamekasan Utara (Pakong, Pegantenan, Batumarmar) yang sering mengalami spike koneksi.
  - Jika kunci sudah berstatus `PENDING`: tolak request dengan HTTP 409 Conflict untuk mengeliminasi thundering herd.
  - Jika kunci sudah berstatus `COMMITTED`: kembalikan cached response (HTTP 200) tanpa memicu serverless function.
- **Fase 2 — COMMITTED / DELETED (Finalisasi)**:
  - Jika penulisan ke NeonDB berhasil: update status kunci menjadi `COMMITTED` dengan TTL 24 jam, simpan response payload di key terpisah (`${key}:response`).
  - Jika penulisan ke NeonDB gagal atau timeout: HAPUS kunci dari Upstash Redis (`DEL`) agar client aman melakukan retry.
- DILARANG mengimplementasikan logika idempotensi di dalam Server Action atau route handler — idempotensi WAJIB ditangani di level Edge Middleware.
- **WAJIB menggunakan `withIdempotency()` wrapper** dari `lib/idempotency.ts` untuk setiap route handler yang melakukan operasi penulisan data finansial. Fungsi ini secara otomatis mengelola siklus PENDING → COMMITTED / DELETED tanpa perlu menulis kode Redis manual di setiap file.
- DILARANG menulis logika update status Redis (COMMITTED/DELETED) secara manual di route handler baru — gunakan `withIdempotency()`.
- Contoh penggunaan:
  ```typescript
  import { withIdempotency } from '@/lib/idempotency';
  
  export async function POST(request: NextRequest) {
    return withIdempotency(request, async (idempotencyKey) => {
      // logika bisnis di sini
      return { data: { success: true }, status: 201 };
    });
  }
  ```

## 2. Rate Limiting Tersegmentasi

- Rate limiting WAJIB menggunakan algoritma sliding window dari `@upstash/ratelimit`.
- Segmentasi endpoint:
  - `/api/v1/pos/*` → 20 request/menit per IP tenant
  - `/api/v1/ipubers/*` → 5 request/menit per ID anggota (header `x-member-id`)
  - `/api/v1/commerce/*` → 60 request/menit per IP publik
- Jika Upstash Redis tidak tersedia (down/misconfigured): WAJIB graceful bypass (jangan blokir traffic).
- Rate limiting hanya berlaku pada `/api/v1/*` — halaman statis WAJIB bypass total.

## 3. Keamanan Webhook Xendit

- Validasi callback WAJIB menggunakan header `x-callback-token` dengan perbandingan timing-safe (constant-time comparison).
- DILARANG menggunakan operator `===` langsung untuk membandingkan token — gunakan loop XOR byte-per-byte.
- Perlindungan double top-up berlapis:
  1. SELECT check: apakah `external_id` sudah berstatus `COMPLETED`
  2. `INSERT ... ON CONFLICT (idempotency_key) DO NOTHING`
- Isolation level: READ COMMITTED (BUKAN SERIALIZABLE + FOR UPDATE).
- Jika duplikat terdeteksi: return HTTP 200 (bukan 409) agar Xendit tidak melakukan retry.
- Setelah transaksi berhasil: update status idempotensi di Upstash ke `COMMITTED`.
- Setelah transaksi gagal: DELETE kunci dari Upstash untuk mengizinkan retry.

## 4. Parsing IP yang Aman

- Parsing IP dari header `x-forwarded-for` WAJIB mengikuti urutan operasi berikut:
  1. Panggil `.split(',')` pada string header → menghasilkan array
  2. Ambil elemen index `[0]` dari array
  3. Periksa eksistensi elemen (null check)
  4. BARU KEMUDIAN panggil `.trim()` pada string hasil
- DILARANG memanggil `.trim()` langsung pada hasil `get('x-forwarded-for')` tanpa split terlebih dahulu.
- Alasan: mencegah runtime crash pada serverless function jika header berisi multiple IP yang dipisahkan koma.

## 5. Koneksi Database di Serverless

- Gunakan `@neondatabase/serverless` Pool dengan `max: 3-5` koneksi.
- Setiap penggunaan `pool.connect()` WAJIB diikuti `finally { client.release() }`.
- Untuk operasi build-time (generateStaticParams, sitemap): gunakan `pool.end()` setelah selesai.
- DILARANG membuat koneksi database di level module scope tanpa lazy initialization.

## 6. Meta Conversions API (CAPI)

- Pemanggilan Graph API Meta WAJIB dikemas dalam `waitUntil()` untuk background execution.
- Response ke client WAJIB dikembalikan SEGERA (HTTP 202 Accepted) sebelum Graph API call selesai.
- Alasan: menghemat compute time Vercel Hobby Plan — billing berhenti setelah response terkirim.
- PII (email, phone) WAJIB di-hash SHA-256 sebelum dikirim ke Meta.
- Jika `waitUntil()` tidak tersedia (local dev): gunakan fire-and-forget pattern tanpa await.

## 7. Error Handling

- Setiap route handler WAJIB memiliki try-catch dengan rollback database jika menggunakan transaksi.
- Error response WAJIB menggunakan format JSON konsisten: `{ error: string, code?: string }`.
- DILARANG mengekspos stack trace atau detail internal error ke client di production.
- Log error ke console dengan prefix yang jelas: `[NamaModule] pesan error`.

## 8. Free Tier Compliance (Upstash Free)

- Batas: 10.000 commands/hari.
- Rate limiting + idempotensi hanya pada `/api/v1/*` (bukan static pages).
- Matcher middleware: `['/api/v1/:path*']` — DILARANG memperluas ke seluruh route.
- Jika mendekati batas harian: pertimbangkan mengurangi TTL atau menghapus rate limit pada endpoint non-kritis.

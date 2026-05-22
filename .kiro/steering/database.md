---
inclusion: always
---

# Aturan Pengembangan Database — KDKMP JASASAJA

## Hierarki Kebenaran

Jika terdapat kontradiksi antara draf skema awal (Gem 2) dengan implementasi aman (Gem 3/4) atau koreksi Master Validator, maka instruksi Master Validator dan Gem 3/4 WAJIB dimenangkan secara mutlak.

## 1. Multi-Tenancy via Row-Level Security (RLS)

- Setiap tabel transaksional WAJIB menggunakan isolasi tenant logis melalui PostgreSQL Row-Level Security (RLS).
- Policy RLS terikat pada fungsi `current_setting('app.current_tenant_id')` yang di-set per request oleh layer aplikasi Next.js.
- Fungsi helper `current_tenant_id()` WAJIB dideklarasikan sebagai `STABLE` dan menangani exception gracefully (return NULL jika setting belum di-set).
- Setiap tabel yang menyimpan data operasional gerai WAJIB memiliki kolom `tenant_id UUID NOT NULL REFERENCES tenants(id)`.
- DILARANG membuat query lintas-tenant tanpa mekanisme audit eksplisit (misalnya role auditor dengan policy terpisah).

## 2. Otomatisasi Akuntansi SAK EP via Database Trigger

- Pencatatan jurnal ganda (double-entry) SAK EP WAJIB ditangani secara eksklusif oleh fungsi trigger PL/pgSQL `generate_sak_ep_journal_entries()`.
- Trigger ini WAJIB di-fire `AFTER INSERT ON daily_closings` — bukan di level aplikasi Next.js.
- Alasan arsitektural: menghindari serverless timeout pada Vercel Hobby Plan (10 detik) saat volume transaksi tinggi.
- Trigger WAJIB membuat entri berpasangan: satu baris DEBIT (Kas/Aset) dan satu baris KREDIT (Pendapatan/Revenue) dengan jumlah identik.
- Jika akun COA belum ada untuk tenant tertentu, trigger WAJIB melakukan auto-create (INSERT IF NOT EXISTS).

## 3. Mitigasi Race Condition pada Hash Chain

- Pencarian `prev_hash` di dalam fungsi trigger WAJIB menggunakan klausa isolasi ketat:
  ```sql
  SELECT row_hash INTO v_prev_hash
  FROM ledger_entries
  WHERE tenant_id = NEW.tenant_id
  ORDER BY id DESC
  LIMIT 1;
  ```
- DILARANG melakukan pencarian `prev_hash` tanpa filter `WHERE tenant_id = NEW.tenant_id`.
- Alasan: mengeliminasi lock contention pada level tabel saat ratusan/ribuan gerai melakukan penutupan buku harian secara serempak di tingkat nasional.
- Genesis hash (entri pertama per tenant): `decode(repeat('0', 64), 'hex')` — 32 bytes zero.

## 4. Isolasi Transaksi dan Perlindungan Duplikasi

- Isolation level untuk endpoint transaksi pembayaran: `READ COMMITTED` (default PostgreSQL).
- DILARANG menggunakan `SERIALIZABLE` atau `SELECT ... FOR UPDATE` pada webhook handler karena menyebabkan serverless timeout crash di bawah lonjakan traffic Meta Ads.
- Setiap tabel transaksi WAJIB memiliki constraint `UNIQUE` pada kolom `idempotency_key`.
- Perlindungan duplikasi berlapis:
  1. **Layer 1**: SELECT check apakah `idempotency_key` sudah berstatus `COMPLETED`
  2. **Layer 2**: `INSERT ... ON CONFLICT (idempotency_key) DO NOTHING` sebagai safety net terakhir
- Jika INSERT mengembalikan 0 rows (conflict), handler WAJIB return HTTP 200 (bukan error) agar payment gateway tidak melakukan retry.

## 5. Imutabilitas Ledger via Hash Chaining Kriptografis

- Ekstensi `pgcrypto` WAJIB diaktifkan untuk fungsi `digest()`.
- Formula hash chaining yang WAJIB dipatuhi:
  ```
  H_n = SHA256(ID_tx || '|' || ID_acc || '|' || D || '|' || C || '|' || H_{n-1})
  ```
  Dimana:
  - `ID_tx` = UUID transaksi (text)
  - `ID_acc` = UUID akun COA (text)
  - `D` = nilai debit (text)
  - `C` = nilai kredit (text)
  - `H_{n-1}` = hash baris sebelumnya (hex-encoded)
- Tipe data kolom hash: `BYTEA` (bukan VARCHAR).
- DILARANG membuat trigger UPDATE atau DELETE pada tabel `ledger_entries` — tabel ini bersifat append-only.

## 6. Tipe Data dan Indeks

- Primary key: `UUID` (via `gen_random_uuid()`) untuk mencegah kebocoran informasi antar-tenant.
- Kolom moneter: `NUMERIC(15, 2)` — bukan FLOAT atau DOUBLE.
- Kolom ledger sequence: `BIGSERIAL` untuk ordering deterministik.
- Indeks komposit WAJIB dibuat pada pola query yang sering digunakan:
  - `(tenant_id, id DESC)` pada `ledger_entries` untuk hash chain lookup
  - `(tenant_id, created_at DESC)` pada tabel transaksional
  - `(region, subdistrict, village)` pada `tenants` untuk pSEO generateStaticParams

## 7. Free Tier Compliance (NeonDB Free)

- Batas: 0.5 GB storage, 100 concurrent connections.
- Connection pooling: `max: 3-5` per Pool instance.
- DILARANG membuka koneksi tanpa `finally { client.release() }` atau `pool.end()`.
- Query untuk sitemap dan generateStaticParams WAJIB menggunakan `LIMIT` dan pagination.

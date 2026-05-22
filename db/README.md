# KDKMP JASASAJA — Database Architecture (NeonDB Free Tier)

## Hierarki Kebenaran

```
Master Validator > Gem 3/4 (Kode Aman & Strategi) > Gem 2 (Spesifikasi Awal)
```

## Arsitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                    NeonDB PostgreSQL 16+                         │
│                    (Free: 0.5GB, 100 conn)                      │
├─────────────────────────────────────────────────────────────────┤
│  RLS Layer ──► current_setting('app.current_tenant_id')         │
│  Setiap gerai = 1 tenant terisolasi secara logis                │
├─────────────────────────────────────────────────────────────────┤
│  Trigger SAK EP ──► generate_sak_ep_journal_entries()           │
│  AFTER INSERT ON daily_closings                                 │
│  Isolasi: WHERE tenant_id = NEW.tenant_id                       │
├─────────────────────────────────────────────────────────────────┤
│  Hash Chain ──► H_n = SHA256(ID_tx||ID_acc||D||C||H_{n-1})      │
│  Imutabilitas ledger via pgcrypto                               │
└─────────────────────────────────────────────────────────────────┘
```

## Migrasi

```bash
# Set connection string
export NEON_DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/kdkmp?sslmode=require"

# Jalankan migrasi
psql $NEON_DATABASE_URL -f db/schema.sql
```

## Tabel

| Tabel | Fungsi |
|-------|--------|
| `tenants` | Master 189 gerai (= tenant) dengan koordinat spasial |
| `accounts` | Chart of Accounts per tenant (SAK EP) |
| `transactions` | Transaksi dengan idempotency_key UNIQUE |
| `ledger_entries` | Jurnal ganda hash-chained (imutabel) |
| `farmers` | Profil anggota + kredit saprotan tertutup |
| `crop_sales` | Pencatatan tembakau KITMAS & garam Pademawu |
| `daily_closings` | Penutupan kas harian (trigger SAK EP) |

## Keamanan

### Row-Level Security (RLS)
- Semua tabel transaksional dilindungi RLS
- Fungsi `current_tenant_id()` membaca session variable
- Next.js men-set `SET app.current_tenant_id = '...'` per request

### Hash Chaining (Imutabilitas Ledger)
- Formula: `H_n = SHA256(ID_tx || '|' || ID_acc || '|' || D || '|' || C || '|' || H_{n-1})`
- Genesis hash: 64 karakter '0' (32 bytes zero)
- Isolasi per tenant: prev_hash di-query dengan `WHERE tenant_id = NEW.tenant_id`

### Trigger SAK EP
- `generate_sak_ep_journal_entries()` fired AFTER INSERT pada `daily_closings`
- Auto-create akun Kas (ACC-1111) dan Pendapatan (ACC-4100) jika belum ada
- Debit Kas = cash_on_hand, Kredit Pendapatan = cash_on_hand
- Mengeliminasi lock contention saat 189 gerai tutup buku serempak

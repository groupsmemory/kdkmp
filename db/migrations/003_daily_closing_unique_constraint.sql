-- ============================================================================
-- MIGRASI 003: Perlindungan Duplikasi Tutup Buku Harian
-- ============================================================================
-- Masalah: Operator di blank spot bisa tidak sengaja submit tutup buku 2x
--          pada hari yang sama → trigger SAK EP fire 2x → kas ganda di ledger
--
-- Solusi: Tambah closing_date + UNIQUE constraint (tenant_id, closing_date)
--         + idempotency_key untuk perlindungan berlapis
--
-- Jalankan: node db/run-migration.js 003_daily_closing_unique_constraint
-- ============================================================================

-- 1. Tambah kolom closing_date (DATE, derived dari closed_at)
ALTER TABLE daily_closings
  ADD COLUMN IF NOT EXISTS closing_date DATE;

-- 2. Backfill closing_date dari data existing
UPDATE daily_closings
  SET closing_date = (closed_at AT TIME ZONE 'Asia/Jakarta')::DATE
  WHERE closing_date IS NULL;

-- 3. Set NOT NULL setelah backfill
ALTER TABLE daily_closings
  ALTER COLUMN closing_date SET NOT NULL;

-- 4. Set default untuk insert baru
ALTER TABLE daily_closings
  ALTER COLUMN closing_date SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::DATE;

-- 5. Tambah idempotency_key
ALTER TABLE daily_closings
  ADD COLUMN IF NOT EXISTS idempotency_key UUID;

-- 6. UNIQUE constraint: satu tenant hanya bisa tutup buku 1x per hari
-- Ini mencegah trigger SAK EP fire ganda
ALTER TABLE daily_closings
  DROP CONSTRAINT IF EXISTS unique_tenant_daily_closing;

ALTER TABLE daily_closings
  ADD CONSTRAINT unique_tenant_daily_closing UNIQUE (tenant_id, closing_date);

-- 7. UNIQUE constraint pada idempotency_key (perlindungan berlapis)
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_closings_idempotency
  ON daily_closings (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

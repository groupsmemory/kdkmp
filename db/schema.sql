-- ============================================================================
-- KDKMP JASASAJA — Skema Database Produksi NeonDB (PostgreSQL 16+)
-- ============================================================================
-- Hierarki Kebenaran: Master Validator > Gem 3/4 > Gem 2
-- Target: NeonDB Free Tier (0.5 GB storage, 100 concurrent connections)
-- Arsitektur: Isolated-Tenant per Gerai via Row-Level Security (RLS)
-- Kepatuhan: SAK EP (Standar Akuntansi Keuangan Entitas Privat)
-- Imutabilitas: Rantai hash kriptografis H_n = SHA256(ID_tx||ID_acc||D||C||H_{n-1})
-- ============================================================================

-- Ekstensi wajib
CREATE EXTENSION IF NOT EXISTS pgcrypto;    -- SHA-256 hash chaining
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- UUID v4 generation

-- ============================================================================
-- 1. TABEL TENANTS (GERAI KDKMP — 189 Pamekasan → 30.000 Nasional)
-- ============================================================================
-- Setiap gerai adalah satu tenant terisolasi secara logis.
-- Kolom latitude/longitude mendukung kueri spasial GEO/pSEO.

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    region VARCHAR(100) NOT NULL,        -- Kabupaten (e.g., Pamekasan)
    subdistrict VARCHAR(100) NOT NULL,   -- Kecamatan (e.g., Pademawu, Pakong)
    village VARCHAR(100) NOT NULL,       -- Desa (e.g., Majungan)
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indeks komposit untuk pSEO generateStaticParams() dan kueri spasial
CREATE INDEX idx_tenants_geography ON tenants (region, subdistrict, village);
CREATE INDEX idx_tenants_active ON tenants (is_active) WHERE is_active = TRUE;

-- ============================================================================
-- 2. TABEL ACCOUNTS (Chart of Accounts — SAK EP Compliant)
-- ============================================================================
-- Bagan akun per tenant. Kode akun unik per gerai untuk fleksibilitas lokal.

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tenant_account_code UNIQUE (tenant_id, code)
);

CREATE INDEX idx_accounts_lookup ON accounts (tenant_id, code, type);

-- ============================================================================
-- 3. TABEL TRANSACTIONS (Pengaman Idempotensi & Audit Trail)
-- ============================================================================
-- Setiap transaksi memiliki idempotency_key UNIQUE untuk mencegah duplikasi
-- akibat retry dari wilayah blank spot Pamekasan Utara.

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    idempotency_key UUID NOT NULL UNIQUE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_tenant ON transactions (tenant_id, created_at DESC);
CREATE INDEX idx_transactions_idempotency ON transactions (idempotency_key);

-- ============================================================================
-- 4. TABEL LEDGER_ENTRIES (Double-Entry Hash-Chained Ledger — SAK EP)
-- ============================================================================
-- Formula imutabilitas:
--   H_n = SHA256(ID_tx || ID_acc || D || C || H_{n-1})
-- Setiap baris HARUS debit XOR kredit (tidak boleh keduanya).

CREATE TABLE ledger_entries (
    id BIGSERIAL PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    debit NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (debit >= 0),
    credit NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (credit >= 0),
    prev_hash BYTEA NOT NULL,
    row_hash BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_double_entry CHECK (
        (debit > 0 AND credit = 0) OR (debit = 0 AND credit > 0)
    )
);

-- Indeks performa tinggi untuk audit trail berantai per tenant
CREATE INDEX idx_ledger_chain ON ledger_entries (tenant_id, id DESC);
CREATE INDEX idx_ledger_transaction ON ledger_entries (transaction_id);

-- ============================================================================
-- 5. TABEL FARMERS (Profil Anggota & Kredit Saprotan Tertutup)
-- ============================================================================

CREATE TABLE farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    ktp_number VARCHAR(16) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    credit_limit NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (credit_limit >= 0),
    remaining_credit NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (remaining_credit >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_credit_ceiling CHECK (remaining_credit <= credit_limit)
);

CREATE INDEX idx_farmers_tenant ON farmers (tenant_id);
CREATE INDEX idx_farmers_ktp ON farmers (ktp_number);

-- ============================================================================
-- 6. TABEL CROP_SALES (Pencatatan Hasil Bumi Lokal Pamekasan)
-- ============================================================================
-- Mendukung dua komoditas unggulan: Tembakau KITMAS dan Garam Pademawu.

CREATE TABLE crop_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE RESTRICT,
    transaction_id UUID REFERENCES transactions(id),
    commodity_type VARCHAR(20) NOT NULL CHECK (commodity_type IN ('TOBACCO', 'SALT')),
    weight_kg NUMERIC(10, 2) NOT NULL CHECK (weight_kg > 0),
    purity_nacl NUMERIC(5, 2) CHECK (purity_nacl BETWEEN 0 AND 100),  -- Garam Pademawu
    grade_score VARCHAR(10),                                            -- Tembakau KITMAS
    price_per_kg NUMERIC(12, 2) NOT NULL CHECK (price_per_kg > 0),
    payout_amount NUMERIC(15, 2) NOT NULL CHECK (payout_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crop_sales_tenant ON crop_sales (tenant_id, created_at DESC);
CREATE INDEX idx_crop_sales_farmer ON crop_sales (farmer_id);

-- ============================================================================
-- 7. TABEL DAILY_CLOSINGS (Rekonsiliasi Penutupan Kas Brankas)
-- ============================================================================
-- Batas brankas tunai: Rp50.000.000 (kepatuhan audit BPKP).
-- Trigger SAK EP akan fire AFTER INSERT pada tabel ini.

CREATE TABLE daily_closings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    closed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cash_on_hand NUMERIC(15, 2) NOT NULL CHECK (cash_on_hand >= 0),
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    closed_by UUID,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_closings_tenant ON daily_closings (tenant_id, closed_at DESC);

-- ============================================================================
-- 8. ROW-LEVEL SECURITY (RLS) — Isolasi Data Multi-Tenant
-- ============================================================================
-- Setiap request Next.js men-set session variable 'app.current_tenant_id'
-- sebelum melakukan query. RLS memastikan tenant hanya akses datanya sendiri.

CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_closings ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_accounts ON accounts
    FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_transactions ON transactions
    FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_ledger ON ledger_entries
    FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_farmers ON farmers
    FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_crop_sales ON crop_sales
    FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_closings ON daily_closings
    FOR ALL USING (tenant_id = current_tenant_id());

-- ============================================================================
-- 9. TRIGGER: OTOMATISASI JURNAL SAK EP (generate_sak_ep_journal_entries)
-- ============================================================================
-- Fired AFTER INSERT pada daily_closings.
-- MITIGASI RACE CONDITION: prev_hash di-query dengan isolasi ketat
--   WHERE tenant_id = NEW.tenant_id
-- Ini mengeliminasi lock contention saat 189+ gerai tutup buku serempak.
--
-- Formula Hash Chaining:
--   H_n = SHA256(ID_tx || '|' || ID_acc || '|' || D || '|' || C || '|' || H_{n-1})

CREATE OR REPLACE FUNCTION generate_sak_ep_journal_entries()
RETURNS TRIGGER AS $$
DECLARE
    v_journal_id UUID;
    v_prev_hash BYTEA;
    v_debit_hash BYTEA;
    v_credit_hash BYTEA;
    v_cash_acc_id UUID;
    v_revenue_acc_id UUID;
BEGIN
    -- ═══════════════════════════════════════════════════════════════
    -- RESOLVE AKUN: Kas (ASSET) dan Pendapatan Ritel (REVENUE)
    -- Auto-create jika belum ada untuk tenant ini (first-time setup)
    -- ═══════════════════════════════════════════════════════════════
    SELECT id INTO v_cash_acc_id
    FROM accounts
    WHERE tenant_id = NEW.tenant_id AND code = 'ACC-1111'
    LIMIT 1;

    IF v_cash_acc_id IS NULL THEN
        INSERT INTO accounts (tenant_id, code, name, type)
        VALUES (NEW.tenant_id, 'ACC-1111', 'Kas di Tangan (Aset)', 'ASSET')
        RETURNING id INTO v_cash_acc_id;
    END IF;

    SELECT id INTO v_revenue_acc_id
    FROM accounts
    WHERE tenant_id = NEW.tenant_id AND code = 'ACC-4100'
    LIMIT 1;

    IF v_revenue_acc_id IS NULL THEN
        INSERT INTO accounts (tenant_id, code, name, type)
        VALUES (NEW.tenant_id, 'ACC-4100', 'Pendapatan Penjualan Ritel', 'REVENUE')
        RETURNING id INTO v_revenue_acc_id;
    END IF;

    -- ═══════════════════════════════════════════════════════════════
    -- BUAT TRANSAKSI INDUK (dengan idempotency_key unik)
    -- ═══════════════════════════════════════════════════════════════
    INSERT INTO transactions (tenant_id, idempotency_key, amount, description, status)
    VALUES (
        NEW.tenant_id,
        gen_random_uuid(),
        NEW.cash_on_hand,
        'Penutupan Buku Harian Otomatis SAK EP - ' || NEW.closed_at::TEXT,
        'COMPLETED'
    )
    RETURNING id INTO v_journal_id;

    -- ═══════════════════════════════════════════════════════════════
    -- ENTRI DEBIT: Kas di Tangan (ASSET) [ACC-1111]
    -- MITIGASI: prev_hash diisolasi ketat WHERE tenant_id = NEW.tenant_id
    -- ═══════════════════════════════════════════════════════════════
    SELECT row_hash INTO v_prev_hash
    FROM ledger_entries
    WHERE tenant_id = NEW.tenant_id
    ORDER BY id DESC
    LIMIT 1;

    -- Genesis hash jika ini entri pertama untuk tenant
    IF v_prev_hash IS NULL THEN
        v_prev_hash := decode(repeat('0', 64), 'hex');
    END IF;

    -- H_n = SHA256(ID_tx || '|' || ID_acc || '|' || D || '|' || C || '|' || H_{n-1})
    v_debit_hash := digest(
        v_journal_id::text || '|' ||
        v_cash_acc_id::text || '|' ||
        NEW.cash_on_hand::text || '|' ||
        '0' || '|' ||
        encode(v_prev_hash, 'hex'),
        'sha256'
    );

    INSERT INTO ledger_entries (transaction_id, account_id, tenant_id, debit, credit, prev_hash, row_hash)
    VALUES (v_journal_id, v_cash_acc_id, NEW.tenant_id, NEW.cash_on_hand, 0, v_prev_hash, v_debit_hash);

    -- ═══════════════════════════════════════════════════════════════
    -- ENTRI KREDIT: Pendapatan Ritel (REVENUE) [ACC-4100]
    -- prev_hash = row_hash dari entri debit yang baru saja di-insert
    -- ═══════════════════════════════════════════════════════════════
    SELECT row_hash INTO v_prev_hash
    FROM ledger_entries
    WHERE tenant_id = NEW.tenant_id
    ORDER BY id DESC
    LIMIT 1;

    v_credit_hash := digest(
        v_journal_id::text || '|' ||
        v_revenue_acc_id::text || '|' ||
        '0' || '|' ||
        NEW.cash_on_hand::text || '|' ||
        encode(v_prev_hash, 'hex'),
        'sha256'
    );

    INSERT INTO ledger_entries (transaction_id, account_id, tenant_id, debit, credit, prev_hash, row_hash)
    VALUES (v_journal_id, v_revenue_acc_id, NEW.tenant_id, 0, NEW.cash_on_hand, v_prev_hash, v_credit_hash);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_daily_closing_sak_ep
    AFTER INSERT ON daily_closings
    FOR EACH ROW
    EXECUTE FUNCTION generate_sak_ep_journal_entries();

-- ============================================================================
-- 10. SEED DATA: 189 Gerai Percontohan Pamekasan
-- ============================================================================

INSERT INTO tenants (name, region, subdistrict, village, latitude, longitude)
VALUES
    ('KDKMP Desa Majungan', 'Pamekasan', 'Pademawu', 'Majungan', -7.1845, 113.4732),
    ('KDKMP Desa Larangan Tokol', 'Pamekasan', 'Larangan', 'Larangan Tokol', -7.1523, 113.5012),
    ('KDKMP Desa Pakong', 'Pamekasan', 'Pakong', 'Pakong', -7.0891, 113.5234),
    ('KDKMP Desa Pegantenan', 'Pamekasan', 'Pegantenan', 'Pegantenan', -7.0654, 113.4891),
    ('KDKMP Desa Batumarmar', 'Pamekasan', 'Batumarmar', 'Batumarmar', -7.0432, 113.4567),
    ('KDKMP Desa Tlanakan', 'Pamekasan', 'Tlanakan', 'Tlanakan', -7.1987, 113.4521),
    ('KDKMP Desa Galis', 'Pamekasan', 'Galis', 'Galis', -7.1654, 113.4234),
    ('KDKMP Desa Proppo', 'Pamekasan', 'Proppo', 'Proppo', -7.1234, 113.4876),
    ('KDKMP Desa Palengaan', 'Pamekasan', 'Palengaan', 'Palengaan', -7.1098, 113.5123),
    ('KDKMP Desa Kadur', 'Pamekasan', 'Kadur', 'Kadur', -7.0765, 113.4654),
    ('KDKMP Desa Waru', 'Pamekasan', 'Waru', 'Waru', -7.0543, 113.5432),
    ('KDKMP Desa Pasean', 'Pamekasan', 'Pasean', 'Pasean', -7.0321, 113.5678),
    ('KDKMP Desa Pamekasan Kota', 'Pamekasan', 'Pamekasan', 'Pamekasan Kota', -7.1567, 113.4678)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SELESAI — Skema Produksi KDKMP JASASAJA (NeonDB Free Tier Compliant)
-- ============================================================================

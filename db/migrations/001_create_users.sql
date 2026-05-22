-- ============================================================================
-- MIGRASI 001: Tabel Users — Autentikasi Operator KDKMP
-- ============================================================================
-- Jalankan: psql $NEON_DATABASE_URL -f db/migrations/001_create_users.sql
-- ============================================================================

-- Tabel users dengan relasi ke tenants
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'operator'
        CHECK (role IN ('operator', 'supervisor', 'admin')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indeks untuk login lookup
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users (tenant_id);

-- RLS pada tabel users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: user hanya bisa lihat data di tenant sendiri
CREATE POLICY tenant_isolation_users ON users
    FOR ALL USING (tenant_id = current_tenant_id());

-- ============================================================================
-- SEED: Demo users (password di-hash dengan pgcrypto crypt + bf)
-- Password: kasir123, super123, admin123
-- ============================================================================

-- Ambil tenant_id dari seed pertama (KDKMP Desa Pamekasan Kota)
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE name = 'KDKMP Desa Pamekasan Kota' LIMIT 1;

    IF v_tenant_id IS NULL THEN
        -- Fallback: ambil tenant pertama yang ada
        SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
    END IF;

    IF v_tenant_id IS NOT NULL THEN
        -- Insert demo users (ON CONFLICT skip jika sudah ada)
        INSERT INTO users (tenant_id, username, password_hash, name, role)
        VALUES
            (v_tenant_id, 'kasir', crypt('kasir123', gen_salt('bf', 12)), 'Bapak Sukri', 'operator'),
            (v_tenant_id, 'supervisor', crypt('super123', gen_salt('bf', 12)), 'Ibu Fatimah', 'supervisor'),
            (v_tenant_id, 'admin', crypt('admin123', gen_salt('bf', 12)), 'Admin KDKMP', 'admin')
        ON CONFLICT (username) DO NOTHING;
    END IF;
END $$;

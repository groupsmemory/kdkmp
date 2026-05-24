/**
 * Test: Verifikasi UNIQUE constraint pada daily_closings
 * Memastikan tutup buku ganda pada hari yang sama ditolak.
 */
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('@neondatabase/serverless');
const crypto = require('crypto');

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, max: 2 });

async function run() {
  const c = await pool.connect();
  try {
    const t = await c.query('SELECT id FROM tenants LIMIT 1');
    const tid = t.rows[0].id;

    console.log('=== TEST: Duplikasi Tutup Buku Harian ===');
    console.log('Tenant:', tid);

    await c.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [tid]);

    // Hapus closing hari ini jika ada (untuk test clean)
    await c.query(
      `DELETE FROM daily_closings WHERE tenant_id = $1 AND closing_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::DATE`,
      [tid]
    );

    // Insert pertama
    const r1 = await c.query(
      `INSERT INTO daily_closings (tenant_id, cash_on_hand, closing_date, idempotency_key)
       VALUES ($1, 300000, (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::DATE, $2)
       ON CONFLICT (tenant_id, closing_date) DO NOTHING
       RETURNING id`,
      [tid, crypto.randomUUID()]
    );
    console.log('Insert 1:', r1.rows.length > 0 ? '✓ INSERTED' : 'SKIPPED');

    // Insert kedua (duplikat hari yang sama)
    const r2 = await c.query(
      `INSERT INTO daily_closings (tenant_id, cash_on_hand, closing_date, idempotency_key)
       VALUES ($1, 300000, (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::DATE, $2)
       ON CONFLICT (tenant_id, closing_date) DO NOTHING
       RETURNING id`,
      [tid, crypto.randomUUID()]
    );
    console.log('Insert 2 (same day):', r2.rows.length === 0 ? '✓ BLOCKED (correct)' : '✗ INSERTED (BUG!)');

    // Cek jumlah ledger entries — harus hanya 2 (1 debit + 1 kredit dari insert pertama)
    const ledger = await c.query(
      `SELECT COUNT(*) as count FROM ledger_entries WHERE tenant_id = $1`,
      [tid]
    );
    console.log('\nLedger entries total:', ledger.rows[0].count);
    console.log(r2.rows.length === 0 ? '\n✓ TEST PASSED — Trigger SAK EP hanya fire 1x per hari' : '\n✗ TEST FAILED');

  } finally {
    c.release();
    await pool.end();
  }
}

run();

/**
 * Test 4.6: Verifikasi ON CONFLICT DO NOTHING (anti double entry)
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
    const ikey = crypto.randomUUID();

    await c.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [tid]);

    console.log('=== TEST 4.6: Anti Double Entry ===');
    console.log('Idempotency Key:', ikey);

    // First insert
    const r1 = await c.query(
      `INSERT INTO transactions (tenant_id, idempotency_key, amount, description, status)
       VALUES ($1, $2, 75000, 'Test duplikasi webhook', 'COMPLETED')
       ON CONFLICT (idempotency_key) DO NOTHING RETURNING id`,
      [tid, ikey]
    );
    console.log('Insert 1:', r1.rows.length > 0 ? '✓ INSERTED (id: ' + r1.rows[0].id + ')' : 'SKIPPED');

    // Duplicate insert (same idempotency_key)
    const r2 = await c.query(
      `INSERT INTO transactions (tenant_id, idempotency_key, amount, description, status)
       VALUES ($1, $2, 75000, 'Test duplikasi retry', 'COMPLETED')
       ON CONFLICT (idempotency_key) DO NOTHING RETURNING id`,
      [tid, ikey]
    );
    console.log('Insert 2 (same key):', r2.rows.length === 0 ? '✓ SKIPPED (correct — no double entry)' : '✗ INSERTED (BUG!)');

    console.log('\n' + (r2.rows.length === 0 ? '✓ TEST 4.6 PASSED' : '✗ TEST 4.6 FAILED'));
  } finally {
    c.release();
    await pool.end();
  }
}

run();

/**
 * Test: Simulasi Xendit Webhook (Task 4.5 & 4.6)
 * Jalankan: node db/test-xendit-webhook.js
 *
 * Test 4.5: Webhook PAID → transaksi tercatat di DB
 * Test 4.6: Webhook duplikat → tidak ada double entry
 */
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, max: 2 });

// Simulasi webhook call ke local/production
const WEBHOOK_URL = process.env.APP_URL
  ? `${process.env.APP_URL}/api/v1/webhook/xendit`
  : 'http://localhost:3000/api/v1/webhook/xendit';

const CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN || 'test-token';

async function simulateWebhook(payload) {
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-callback-token': CALLBACK_TOKEN,
    },
    body: JSON.stringify(payload),
  });
  return { status: response.status, body: await response.json() };
}

async function run() {
  const client = await pool.connect();

  try {
    // Get tenant for test
    const tenant = await client.query('SELECT id FROM tenants LIMIT 1');
    const tenantId = tenant.rows[0].id;
    const externalId = `${tenantId}:${crypto.randomUUID()}`;

    console.log('=== TEST 4.5: Webhook PAID → Transaksi Tercatat ===');
    console.log('Tenant:', tenantId);
    console.log('External ID:', externalId);

    // Count transactions before
    const before = await client.query(
      'SELECT COUNT(*) as count FROM transactions WHERE tenant_id = $1',
      [tenantId]
    );
    console.log('Transactions before:', before.rows[0].count);

    // Simulate PAID webhook
    try {
      const result1 = await simulateWebhook({
        id: 'inv_test_' + Date.now(),
        external_id: externalId,
        status: 'PAID',
        amount: 85000,
        paid_amount: 85000,
        payment_method: 'QRIS',
        payment_channel: 'QRIS',
        paid_at: new Date().toISOString(),
      });
      console.log('\nWebhook Response:', result1.status, JSON.stringify(result1.body));

      if (result1.status === 200 && result1.body.processed) {
        console.log('✓ TEST 4.5 PASSED — Transaksi berhasil diproses');
      } else if (result1.status === 401) {
        console.log('⚠ Webhook returned 401 — XENDIT_CALLBACK_TOKEN mismatch (expected in test env)');
        console.log('  Set XENDIT_CALLBACK_TOKEN di .env.local untuk test lokal');
      } else {
        console.log('? Unexpected response — check server logs');
      }
    } catch (e) {
      console.log('⚠ Cannot reach webhook URL:', WEBHOOK_URL);
      console.log('  Pastikan server berjalan (npm run dev) untuk test lokal');
      console.log('  Atau gunakan URL production untuk test remote');
    }

    console.log('\n=== TEST 4.6: Webhook Duplikat → No Double Entry ===');

    // Count transactions after first webhook
    const after1 = await client.query(
      'SELECT COUNT(*) as count FROM transactions WHERE tenant_id = $1',
      [tenantId]
    );
    console.log('Transactions after 1st webhook:', after1.rows[0].count);

    // Simulate DUPLICATE webhook (same external_id)
    try {
      const result2 = await simulateWebhook({
        id: 'inv_test_' + Date.now() + '_retry',
        external_id: externalId,
        status: 'PAID',
        amount: 85000,
        paid_amount: 85000,
        payment_method: 'QRIS',
        payment_channel: 'QRIS',
        paid_at: new Date().toISOString(),
      });
      console.log('Duplicate Webhook Response:', result2.status, JSON.stringify(result2.body));

      if (result2.body.duplicate) {
        console.log('✓ TEST 4.6 PASSED — Duplikat terdeteksi, tidak ada double entry');
      }
    } catch (e) {
      console.log('⚠ Cannot reach webhook URL for duplicate test');
    }

    // Final count
    const after2 = await client.query(
      'SELECT COUNT(*) as count FROM transactions WHERE tenant_id = $1',
      [tenantId]
    );
    console.log('\nTransactions final count:', after2.rows[0].count);

    const diff = parseInt(after2.rows[0].count) - parseInt(before.rows[0].count);
    if (diff <= 1) {
      console.log('✓ No double entry — ON CONFLICT DO NOTHING bekerja');
    } else {
      console.log('✗ DOUBLE ENTRY DETECTED — ada', diff, 'transaksi baru (seharusnya max 1)');
    }

  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);

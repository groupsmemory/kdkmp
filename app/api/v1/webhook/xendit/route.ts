/**
 * ============================================================================
 * KDKMP JASASAJA — Webhook Xendit (Anti-Fraud Payment Handler)
 * ============================================================================
 * Hierarki: Master Validator > Gem 3/4 > Gem 2
 *
 * Mitigasi Double Top-Up:
 *   1. Validasi x-callback-token (timing-safe comparison)
 *   2. Transaction isolation: READ COMMITTED (bukan SERIALIZABLE + FOR UPDATE
 *      yang menyebabkan serverless timeout crash di bawah traffic Meta Ads)
 *   3. SELECT check: apakah external_id sudah COMPLETED
 *   4. ON CONFLICT (idempotency_key) DO NOTHING sebagai safety net terakhir
 *
 * Free Tier Compliance:
 *   - NeonDB Free: max 100 concurrent connections
 *   - READ COMMITTED menghindari long-held locks
 *   - Vercel Hobby: 10s function timeout
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

// ═══════════════════════════════════════════════════════════════
// DATABASE POOL (Singleton untuk serverless)
// ═══════════════════════════════════════════════════════════════

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.NEON_DATABASE_URL;
    if (!connectionString) {
      throw new Error('[Xendit Webhook] NEON_DATABASE_URL tidak dikonfigurasi');
    }
    pool = new Pool({ connectionString, max: 5 });
  }
  return pool;
}

// ═══════════════════════════════════════════════════════════════
// TIPE DATA XENDIT CALLBACK
// ═══════════════════════════════════════════════════════════════

interface XenditCallbackPayload {
  id: string;
  external_id: string;
  status: string;
  amount: number;
  paid_amount?: number;
  payment_method?: string;
  payment_channel?: string;
  paid_at?: string;
}

// ═══════════════════════════════════════════════════════════════
// VALIDASI SIGNATURE (Timing-Safe)
// ═══════════════════════════════════════════════════════════════

function verifyCallbackToken(received: string | null, expected: string): boolean {
  if (!received || received.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < received.length; i++) {
    mismatch |= received.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

// ═══════════════════════════════════════════════════════════════
// ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  // 1. Validasi callback token
  const callbackToken = request.headers.get('x-callback-token');
  const expectedToken = process.env.XENDIT_CALLBACK_TOKEN;

  if (!expectedToken) {
    console.error('[Xendit] XENDIT_CALLBACK_TOKEN belum dikonfigurasi');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  if (!verifyCallbackToken(callbackToken, expectedToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse payload
  let payload: XenditCallbackPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 3. Validasi field wajib
  if (!payload.id || !payload.external_id || !payload.status) {
    return NextResponse.json(
      { error: 'Missing required fields: id, external_id, status' },
      { status: 400 }
    );
  }

  // 4. Hanya proses PAID (abaikan EXPIRED, PENDING, dll)
  if (payload.status !== 'PAID') {
    return NextResponse.json({ received: true, status: payload.status });
  }

  // ═══════════════════════════════════════════════════════════════
  // 5. PROSES PEMBAYARAN DENGAN PERLINDUNGAN DUPLIKASI
  // Isolation Level: READ COMMITTED (default PostgreSQL)
  // BUKAN SERIALIZABLE + FOR UPDATE → menghindari timeout crash
  // ═══════════════════════════════════════════════════════════════

  const db = getPool();
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // ─────────────────────────────────────────────────────────────
    // 5a. CHECK DUPLIKASI: Apakah external_id sudah COMPLETED?
    // Ini adalah garis pertahanan pertama sebelum INSERT
    // ─────────────────────────────────────────────────────────────
    const existingCheck = await client.query(
      `SELECT id, status FROM transactions
       WHERE idempotency_key = $1::UUID
       AND status = 'COMPLETED'
       LIMIT 1`,
      [payload.external_id]
    );

    if (existingCheck.rows.length > 0) {
      // Duplikat terdeteksi — return 200 agar Xendit tidak retry
      await client.query('COMMIT');
      return NextResponse.json({
        received: true,
        duplicate: true,
        message: 'Payment already processed',
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 5b. INSERT TRANSAKSI dengan ON CONFLICT DO NOTHING
    // Safety net: jika race condition lolos dari SELECT check
    // ─────────────────────────────────────────────────────────────
    const amount = payload.paid_amount || payload.amount;

    // Resolve tenant dari external_id pattern (format: TENANT_UUID:description)
    const tenantId = payload.external_id.split(':')[0];

    const insertResult = await client.query(
      `INSERT INTO transactions (tenant_id, idempotency_key, amount, description, status)
       VALUES ($1::UUID, $2::UUID, $3, $4, 'COMPLETED')
       ON CONFLICT (idempotency_key) DO NOTHING
       RETURNING id`,
      [
        tenantId,
        payload.external_id,
        amount,
        `Pembayaran Xendit #${payload.id} via ${payload.payment_channel || 'unknown'}`,
      ]
    );

    if (insertResult.rows.length === 0) {
      // ON CONFLICT triggered — duplikat, aman
      await client.query('COMMIT');
      return NextResponse.json({ received: true, duplicate: true });
    }

    // ─────────────────────────────────────────────────────────────
    // 5c. UPDATE STATUS IDEMPOTENSI DI UPSTASH → COMMITTED
    // Agar middleware mengembalikan cached response untuk retry
    // ─────────────────────────────────────────────────────────────
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = Redis.fromEnv();
      const redisKey = `idempotency:${payload.external_id}`;
      const responsePayload = { received: true, processed: true, transactionId: insertResult.rows[0].id };
      await redis.set(redisKey, 'COMMITTED', { ex: 86400 });
      await redis.set(`${redisKey}:response`, JSON.stringify(responsePayload), { ex: 86400 });
    } catch {
      // Non-fatal: idempotency cache gagal, tapi transaksi DB sudah aman
      console.warn('[Xendit] Gagal update idempotency cache di Upstash');
    }

    await client.query('COMMIT');

    return NextResponse.json({
      received: true,
      processed: true,
      transactionId: insertResult.rows[0].id,
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('[Xendit] Processing error:', error?.message);

    // ─────────────────────────────────────────────────────────────
    // MITIGASI: Hapus kunci PENDING dari Upstash agar client bisa retry
    // ─────────────────────────────────────────────────────────────
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = Redis.fromEnv();
      await redis.del(`idempotency:${payload.external_id}`);
    } catch {
      // Non-fatal
    }

    return NextResponse.json(
      { error: 'Internal processing error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

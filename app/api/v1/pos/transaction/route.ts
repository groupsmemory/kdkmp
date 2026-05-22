/**
 * ============================================================================
 * API: POST /api/v1/pos/transaction
 * ============================================================================
 * Menerima transaksi POS dari client (online sync atau offline queue flush).
 * Dilindungi oleh:
 *   - Rate limiting 20 req/menit (middleware.ts)
 *   - Idempotensi 2-fase (middleware.ts)
 *   - ON CONFLICT (idempotency_key) DO NOTHING (database)
 *   - Input validation (Zod)
 *
 * Setelah berhasil: update status idempotensi ke COMMITTED di Upstash.
 * Setelah gagal: DELETE kunci dari Upstash agar client bisa retry.
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// VALIDASI INPUT
// ═══════════════════════════════════════════════════════════════

const TransactionSchema = z.object({
  tenantId: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().min(1),
  items: z.array(z.object({
    name: z.string(),
    qty: z.number().int().positive(),
    price: z.number().positive(),
  })).min(1),
  paymentMethod: z.enum(['CASH', 'QRIS']),
});

// ═══════════════════════════════════════════════════════════════
// DATABASE POOL
// ═══════════════════════════════════════════════════════════════

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.NEON_DATABASE_URL;
    if (!connectionString) {
      throw new Error('[POS API] NEON_DATABASE_URL tidak dikonfigurasi');
    }
    pool = new Pool({ connectionString, max: 5 });
  }
  return pool;
}

// ═══════════════════════════════════════════════════════════════
// ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  // 1. Parse & validate body
  let body: z.infer<typeof TransactionSchema>;
  try {
    const raw = await request.json();
    body = TransactionSchema.parse(raw);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Input tidak valid', details: error?.message },
      { status: 400 }
    );
  }

  // 2. Ambil idempotency key dari header (di-set oleh middleware)
  const idempotencyKey = request.headers.get('x-idempotency-key') || crypto.randomUUID();

  // 3. Insert ke database dengan ON CONFLICT DO NOTHING
  const db = getPool();
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Set tenant context untuk RLS
    await client.query(`SET LOCAL app.current_tenant_id = '${body.tenantId}'`);

    // INSERT dengan perlindungan duplikasi
    const result = await client.query(
      `INSERT INTO transactions (tenant_id, idempotency_key, amount, description, status)
       VALUES ($1::UUID, $2::UUID, $3, $4, 'COMPLETED')
       ON CONFLICT (idempotency_key) DO NOTHING
       RETURNING id`,
      [body.tenantId, idempotencyKey, body.amount, body.description]
    );

    if (result.rows.length === 0) {
      // Duplikat — sudah diproses sebelumnya
      await client.query('COMMIT');
      return NextResponse.json({ success: true, duplicate: true });
    }

    await client.query('COMMIT');

    const transactionId = result.rows[0].id;

    // 4. Update idempotensi ke COMMITTED di Upstash
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = Redis.fromEnv();
      const redisKey = `idempotency:${idempotencyKey}`;
      const responsePayload = { success: true, transactionId };
      await redis.set(redisKey, 'COMMITTED', { ex: 86400 });
      await redis.set(`${redisKey}:response`, JSON.stringify(responsePayload), { ex: 86400 });
    } catch {
      // Non-fatal: cache gagal tapi transaksi DB aman
    }

    return NextResponse.json({
      success: true,
      transactionId,
      amount: body.amount,
    }, { status: 201 });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('[POS API] Error:', error?.message);

    // DELETE kunci dari Upstash agar client bisa retry
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = Redis.fromEnv();
      await redis.del(`idempotency:${idempotencyKey}`);
    } catch {
      // Non-fatal
    }

    return NextResponse.json(
      { error: 'Gagal menyimpan transaksi' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

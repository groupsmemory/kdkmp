/**
 * ============================================================================
 * API: POST /api/v1/pos/daily-closing
 * ============================================================================
 * Menerima data penutupan buku harian dari terminal POS.
 * INSERT ke tabel daily_closings → trigger SAK EP otomatis generate jurnal.
 *
 * Dilindungi oleh:
 *   - Rate limiting 20 req/menit (middleware.ts)
 *   - Idempotensi 2-fase (middleware.ts)
 *   - Input validation (Zod)
 *
 * Setelah berhasil: update status idempotensi ke COMMITTED di Upstash.
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';

// ═══════════════════════════════════════════════════════════════
// VALIDASI INPUT
// ═══════════════════════════════════════════════════════════════

const DailyClosingSchema = z.object({
  tenantId: z.string().min(1),
  cashOnHand: z.number().min(0),
  notes: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════════
// DATABASE POOL
// ═══════════════════════════════════════════════════════════════

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.NEON_DATABASE_URL;
    if (!connectionString) {
      throw new Error('[Daily Closing API] NEON_DATABASE_URL tidak dikonfigurasi');
    }
    pool = new Pool({ connectionString, max: 5 });
  }
  return pool;
}

// ═══════════════════════════════════════════════════════════════
// ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  // 0. Verify authentication
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  const { session } = auth;

  // 1. Parse & validate body
  let body: z.infer<typeof DailyClosingSchema>;
  try {
    const raw = await request.json();
    body = DailyClosingSchema.parse(raw);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Input tidak valid', details: message },
      { status: 400 }
    );
  }

  // Override tenantId from session
  const tenantId = session.tenantId;

  // 2. Ambil idempotency key dari header
  const idempotencyKey = request.headers.get('x-idempotency-key') || crypto.randomUUID();

  // 3. Insert ke database
  const db = getPool();
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Set tenant context untuk RLS (parameterized — anti SQL injection)
    await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [tenantId]);

    // INSERT daily_closings dengan perlindungan duplikasi per hari
    // UNIQUE (tenant_id, closing_date) mencegah trigger SAK EP fire ganda
    const result = await client.query(
      `INSERT INTO daily_closings (tenant_id, cash_on_hand, is_locked, notes, idempotency_key, closing_date)
       VALUES ($1::UUID, $2, $3, $4, $5::UUID, (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::DATE)
       ON CONFLICT (tenant_id, closing_date) DO NOTHING
       RETURNING id, closed_at, closing_date`,
      [
        tenantId,
        body.cashOnHand,
        body.cashOnHand > 50_000_000,
        body.notes || null,
        idempotencyKey,
      ]
    );

    if (result.rows.length === 0) {
      // Duplikat: tutup buku hari ini sudah dilakukan
      await client.query('COMMIT');
      return NextResponse.json({
        success: true,
        duplicate: true,
        message: 'Tutup buku hari ini sudah dilakukan sebelumnya.',
      });
    }

    await client.query('COMMIT');

    const closingId = result.rows[0].id;
    const closedAt = result.rows[0].closed_at;

    // 4. Update idempotensi ke COMMITTED di Upstash
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = Redis.fromEnv();
      const redisKey = `idempotency:${idempotencyKey}`;
      const responsePayload = { success: true, closingId, closedAt };
      await redis.set(redisKey, 'COMMITTED', { ex: 86400 });
      await redis.set(`${redisKey}:response`, JSON.stringify(responsePayload), { ex: 86400 });
    } catch {
      // Non-fatal: cache gagal tapi data DB aman
    }

    return NextResponse.json({
      success: true,
      closingId,
      closedAt,
      cashOnHand: body.cashOnHand,
      journalGenerated: true,
    }, { status: 201 });

  } catch (error: unknown) {
    await client.query('ROLLBACK');
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Daily Closing API] Error:', message);

    // DELETE kunci dari Upstash agar client bisa retry
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = Redis.fromEnv();
      await redis.del(`idempotency:${idempotencyKey}`);
    } catch {
      // Non-fatal
    }

    return NextResponse.json(
      { error: 'Gagal menyimpan penutupan buku harian' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

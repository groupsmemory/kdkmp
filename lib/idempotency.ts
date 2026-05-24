/**
 * ============================================================================
 * KDKMP JASASAJA — Idempotency Lifecycle Manager (Higher-Order Function)
 * ============================================================================
 * Fungsi pembungkus yang otomatis mengelola siklus hidup:
 *   PENDING → COMMITTED (jika sukses)
 *   PENDING → DELETED (jika gagal)
 *
 * Penggunaan:
 *   import { withIdempotency } from '@/lib/idempotency';
 *
 *   export async function POST(request: NextRequest) {
 *     return withIdempotency(request, async (idempotencyKey) => {
 *       // ... logika bisnis ...
 *       return { data: result, status: 201 };
 *     });
 *   }
 *
 * Middleware sudah set PENDING di Upstash. Fungsi ini:
 *   1. Extract idempotency key dari header
 *   2. Jalankan handler
 *   3. Jika sukses → set COMMITTED + cache response (TTL 24 jam)
 *   4. Jika gagal → DELETE key dari Upstash (izinkan retry)
 *
 * Ini mengeliminasi risiko lupa update status Redis di route baru.
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

const COMMITTED_TTL_SECONDS = 86400; // 24 jam

interface HandlerResult {
  data: Record<string, unknown>;
  status?: number;
}

/**
 * Higher-order function untuk mengelola siklus hidup idempotensi.
 * Wrap logika bisnis route handler di dalam fungsi ini.
 */
export async function withIdempotency(
  request: NextRequest,
  handler: (idempotencyKey: string) => Promise<HandlerResult>
): Promise<NextResponse> {
  const idempotencyKey = request.headers.get('x-idempotency-key') || crypto.randomUUID();

  try {
    // Jalankan logika bisnis
    const result = await handler(idempotencyKey);

    // SUKSES → Update status ke COMMITTED di Upstash
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = Redis.fromEnv();
      const redisKey = `idempotency:${idempotencyKey}`;
      await redis.set(redisKey, 'COMMITTED', { ex: COMMITTED_TTL_SECONDS });
      await redis.set(`${redisKey}:response`, JSON.stringify(result.data), { ex: COMMITTED_TTL_SECONDS });
    } catch {
      // Non-fatal: cache gagal tapi operasi DB sudah aman
      console.warn('[Idempotency] Gagal update status COMMITTED di Upstash');
    }

    return NextResponse.json(result.data, { status: result.status || 200 });

  } catch (error: unknown) {
    // GAGAL → DELETE key dari Upstash agar client bisa retry
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = Redis.fromEnv();
      await redis.del(`idempotency:${idempotencyKey}`);
    } catch {
      // Non-fatal
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Idempotency] Handler error:', message);

    return NextResponse.json(
      { error: 'Operasi gagal. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}

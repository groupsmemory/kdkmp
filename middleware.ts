/**
 * ============================================================================
 * KDKMP JASASAJA — Next.js Edge Middleware
 * ============================================================================
 * Hierarki: Master Validator > Gem 3/4 > Gem 2
 * Runtime: Vercel Edge (< 1ms cold start, 0 compute cost untuk static)
 *
 * Fungsi:
 *   1. Rate Limiting tersegmentasi per endpoint (Upstash Sliding Window)
 *   2. Idempotensi 2-Fase (PENDING → COMMITTED/DELETED)
 *
 * Free Tier Compliance:
 *   - Upstash Free: 10.000 commands/hari
 *   - Rate limit hanya pada /api/v1/* (bukan static pages)
 *   - Idempotency hanya pada write requests dengan header x-idempotency-key
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// ═══════════════════════════════════════════════════════════════
// INISIALISASI UPSTASH REDIS (Edge-compatible REST API)
// ═══════════════════════════════════════════════════════════════

const redis = Redis.fromEnv();

// Segmentasi Rate Limiter sesuai Gem 3/4 spesifikasi
const posLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  prefix: 'rl:pos',
});

const ipubersLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  prefix: 'rl:ipubers',
});

const commerceLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  prefix: 'rl:commerce',
});

// ═══════════════════════════════════════════════════════════════
// KONSTANTA IDEMPOTENSI
// ═══════════════════════════════════════════════════════════════

const IDEMPOTENCY_HEADER = 'x-idempotency-key';
const PENDING_TTL_SECONDS = 30;       // Toleransi latensi 3G blank spot Pamekasan Utara
const COMMITTED_TTL_SECONDS = 86400;  // 24 jam cache response

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE HANDLER
// ═══════════════════════════════════════════════════════════════

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ─────────────────────────────────────────────────────────────
  // 0. PROTEKSI ROUTE (Auth Check via httpOnly Cookie)
  // ─────────────────────────────────────────────────────────────
  // Halaman /dashboard dan /pos memerlukan session aktif.
  // Jika tidak ada cookie session → redirect ke /login.

  const protectedPaths = ['/dashboard', '/pos'];
  const isProtected = protectedPaths.some((p) => path === p || path.startsWith(p + '/'));

  if (isProtected) {
    const sessionCookie = request.cookies.get('kdkmp_session');
    if (!sessionCookie?.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
    // Token validity is checked at page level for full verification.
    // Middleware only checks cookie existence for performance (Edge runtime).
  }

  // Hanya proses API routes untuk rate limiting & idempotency
  if (!path.startsWith('/api/v1/')) {
    return NextResponse.next();
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1';

  // ─────────────────────────────────────────────────────────────
  // 1. RATE LIMITING TERSEGMENTASI (Sliding Window)
  // ─────────────────────────────────────────────────────────────

  try {
    if (path.startsWith('/api/v1/pos/')) {
      const { success } = await posLimiter.limit(ip);
      if (!success) {
        return buildErrorResponse(
          'Terlalu banyak permintaan transaksi POS. Batas: 20/menit.',
          429
        );
      }
    } else if (path.startsWith('/api/v1/ipubers/')) {
      const memberId = request.headers.get('x-member-id') || ip;
      const { success } = await ipubersLimiter.limit(memberId);
      if (!success) {
        return buildErrorResponse(
          'Penebusan pupuk melebihi ambang batas aman. Batas: 5/menit.',
          429
        );
      }
    } else if (path.startsWith('/api/v1/commerce/')) {
      const { success } = await commerceLimiter.limit(ip);
      if (!success) {
        return buildErrorResponse(
          'Aktivitas pencarian harga dibatasi. Batas: 60/menit.',
          429
        );
      }
    }
  } catch (error) {
    // Graceful bypass: jika Upstash down, jangan blokir traffic
    console.warn('[Middleware] Rate limiting unavailable, bypassing:', error);
  }

  // ─────────────────────────────────────────────────────────────
  // 2. IDEMPOTENSI 2-FASE (PENDING → COMMITTED / DELETED)
  // ─────────────────────────────────────────────────────────────
  // Hanya berlaku untuk write methods (POST, PUT, PATCH)

  const isWriteRequest = ['POST', 'PUT', 'PATCH'].includes(request.method);
  const idempotencyKey = request.headers.get(IDEMPOTENCY_HEADER);

  if (isWriteRequest && idempotencyKey) {
    const redisKey = `idempotency:${idempotencyKey}`;

    try {
      // Cek status kunci yang sudah ada
      const cachedStatus = await redis.get<string>(redisKey);

      // ═══ FASE 2 COMMITTED: Return cached response (replay aman) ═══
      if (cachedStatus === 'COMMITTED') {
        const cachedResponse = await redis.get(`${redisKey}:response`);
        return new NextResponse(
          JSON.stringify(cachedResponse || { success: true, cached: true }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-Idempotency-Status': 'COMMITTED',
              'X-Cache-Lookup': 'HIT',
            },
          }
        );
      }

      // ═══ FASE 1 PENDING: Tolak retry (cegah thundering herd) ═══
      if (cachedStatus === 'PENDING') {
        return new NextResponse(
          JSON.stringify({
            error: 'Permintaan transaksi serupa sedang diproses. Silakan tunggu.',
            code: 'IDEMPOTENCY_PENDING',
            retryAfterMs: PENDING_TTL_SECONDS * 1000,
          }),
          {
            status: 409,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': PENDING_TTL_SECONDS.toString(),
            },
          }
        );
      }

      // ═══ FASE 1 INISIASI: Set PENDING dengan TTL 30 detik ═══
      await redis.set(redisKey, 'PENDING', { ex: PENDING_TTL_SECONDS });

    } catch (error) {
      // Graceful bypass: jika Redis gagal, teruskan request
      console.warn('[Middleware] Idempotency check failed, bypassing:', error);
    }
  }

  return NextResponse.next();
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Build JSON error response
// ═══════════════════════════════════════════════════════════════

function buildErrorResponse(message: string, status: number): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// ═══════════════════════════════════════════════════════════════
// MATCHER: Hanya intercept API routes (static pages bypass total)
// ═══════════════════════════════════════════════════════════════

export const config = {
  matcher: ['/api/v1/:path*', '/dashboard/:path*', '/pos/:path*'],
};

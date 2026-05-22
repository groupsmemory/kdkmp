/**
 * ============================================================================
 * API: POST /api/v1/auth/login
 * ============================================================================
 * Validasi credentials operator kasir terhadap tabel users di NeonDB.
 * Password di-hash dengan pgcrypto crypt(bf) — verifikasi via SQL.
 * Set httpOnly session cookie setelah berhasil.
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';
import { z } from 'zod';
import { signToken, buildSessionCookie } from '@/lib/auth';

// ═══════════════════════════════════════════════════════════════
// VALIDASI INPUT
// ═══════════════════════════════════════════════════════════════

const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(8),
});

// ═══════════════════════════════════════════════════════════════
// DATABASE POOL
// ═══════════════════════════════════════════════════════════════

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.NEON_DATABASE_URL;
    if (!connectionString) {
      throw new Error('[Auth API] NEON_DATABASE_URL tidak dikonfigurasi');
    }
    pool = new Pool({ connectionString, max: 3 });
  }
  return pool;
}

// ═══════════════════════════════════════════════════════════════
// ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  // 1. Parse & validate
  let body: z.infer<typeof LoginSchema>;
  try {
    const raw = await request.json();
    body = LoginSchema.parse(raw);
  } catch {
    return NextResponse.json(
      { error: 'Username dan password wajib diisi (min. 8 karakter).' },
      { status: 400 }
    );
  }

  // 2. Query database — verify credentials with pgcrypto crypt()
  const db = getPool();
  const client = await db.connect();

  try {
    // pgcrypto crypt() comparison: password_hash = crypt(input, password_hash)
    const result = await client.query(
      `SELECT id, tenant_id, username, name, role
       FROM users
       WHERE username = $1
         AND is_active = TRUE
         AND password_hash = crypt($2, password_hash)
       LIMIT 1`,
      [body.username, body.password]
    );

    if (result.rows.length === 0) {
      // Timing-safe: delay untuk mencegah timing attack
      await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 100));
      return NextResponse.json(
        { error: 'Username atau password salah.' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // 3. Update last_login_at
    await client.query(
      `UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [user.id]
    );

    // 4. Sign JWT token
    const token = await signToken({
      userId: user.id,
      tenantId: user.tenant_id,
      name: user.name,
      role: user.role,
    });

    // 5. Set httpOnly cookie dan return response
    const response = NextResponse.json({
      success: true,
      user: {
        name: user.name,
        role: user.role,
      },
    });

    response.headers.set('Set-Cookie', buildSessionCookie(token));

    return response;

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Auth API] Login error:', message);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Coba lagi.' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

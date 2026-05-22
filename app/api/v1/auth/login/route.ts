/**
 * ============================================================================
 * API: POST /api/v1/auth/login
 * ============================================================================
 * Validasi credentials operator kasir dan set httpOnly session cookie.
 * Untuk MVP: validasi terhadap tabel users di NeonDB.
 * Fallback dev: jika DB belum ready, gunakan hardcoded demo credentials.
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
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
// DEMO CREDENTIALS (untuk development sebelum tabel users ada)
// ═══════════════════════════════════════════════════════════════

const DEMO_USERS = [
  {
    username: 'kasir',
    password: 'kasir123',
    userId: 'demo-user-001',
    tenantId: 'default-tenant',
    name: 'Bapak Sukri',
    role: 'operator' as const,
  },
  {
    username: 'supervisor',
    password: 'super123',
    userId: 'demo-user-002',
    tenantId: 'default-tenant',
    name: 'Ibu Fatimah',
    role: 'supervisor' as const,
  },
  {
    username: 'admin',
    password: 'admin123',
    userId: 'demo-user-003',
    tenantId: 'default-tenant',
    name: 'Admin KDKMP',
    role: 'admin' as const,
  },
];

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

  // 2. Validate credentials
  // MVP: cek demo users dulu. Nanti diganti query ke tabel users.
  const user = DEMO_USERS.find(
    (u) => u.username === body.username && u.password === body.password
  );

  if (!user) {
    // Timing-safe: delay sedikit untuk mencegah timing attack
    await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 100));
    return NextResponse.json(
      { error: 'Username atau password salah.' },
      { status: 401 }
    );
  }

  // 3. Sign JWT token
  const token = await signToken({
    userId: user.userId,
    tenantId: user.tenantId,
    name: user.name,
    role: user.role,
  });

  // 4. Set httpOnly cookie dan return response
  const response = NextResponse.json({
    success: true,
    user: {
      name: user.name,
      role: user.role,
    },
  });

  response.headers.set('Set-Cookie', buildSessionCookie(token));

  return response;
}

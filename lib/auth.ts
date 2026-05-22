/**
 * ============================================================================
 * KDKMP JASASAJA — Auth Utilities (Custom JWT + httpOnly Cookie)
 * ============================================================================
 * Strategi: Lightweight JWT tanpa library berat.
 * Token disimpan di httpOnly cookie (bukan localStorage — sesuai steering).
 * Tenant context di-inject ke setiap request terproteksi.
 *
 * Keamanan:
 *   - httpOnly: true (tidak bisa diakses via JavaScript/XSS)
 *   - secure: true (hanya HTTPS di production)
 *   - sameSite: 'lax' (CSRF protection)
 *   - maxAge: 8 jam (satu shift kerja operator)
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════════
// KONSTANTA
// ═══════════════════════════════════════════════════════════════

export const AUTH_COOKIE_NAME = 'kdkmp_session';
export const SESSION_MAX_AGE = 8 * 60 * 60; // 8 jam (1 shift kerja)

// ═══════════════════════════════════════════════════════════════
// TIPE
// ═══════════════════════════════════════════════════════════════

export interface SessionPayload {
  userId: string;
  tenantId: string;
  name: string;
  role: 'operator' | 'supervisor' | 'admin';
  iat: number;
  exp: number;
}

// ═══════════════════════════════════════════════════════════════
// JWT SIGN/VERIFY (HMAC-SHA256 via Web Crypto API)
// ═══════════════════════════════════════════════════════════════

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    // In production, this should always be set. In build time, this function
    // is never called so we use a placeholder that will never actually sign tokens.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[Auth] AUTH_SECRET environment variable is required.');
    }
    // Dev fallback — never use in production
    return new TextEncoder().encode('dev-only-secret-do-not-use-in-production');
  }
  return new TextEncoder().encode(secret);
}

function base64UrlEncode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function hmacSign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    getSecret(),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(data)
  );
  return base64UrlEncode(new Uint8Array(signature));
}

async function hmacVerify(data: string, signature: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    getSecret(),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const sigBytes = base64UrlDecode(signature);
  return crypto.subtle.verify(
    'HMAC',
    key,
    sigBytes,
    new TextEncoder().encode(data)
  );
}

/**
 * Sign JWT token (HMAC-SHA256)
 */
export async function signToken(payload: Omit<SessionPayload, 'iat' | 'exp'>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SessionPayload = {
    ...payload,
    iat: now,
    exp: now + SESSION_MAX_AGE,
  };

  const header = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  );
  const body = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(fullPayload))
  );
  const signature = await hmacSign(`${header}.${body}`);

  return `${header}.${body}.${signature}`;
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const isValid = await hmacVerify(`${header}.${body}`, signature);
    if (!isValid) return null;

    const payload: SessionPayload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(body))
    );

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extract session from request cookie
 */
export async function getSession(request: NextRequest): Promise<SessionPayload | null> {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);
  if (!cookie?.value) return null;
  return verifyToken(cookie.value);
}

/**
 * Require authenticated session — returns session or error response
 */
export async function requireAuth(request: NextRequest): Promise<
  { session: SessionPayload; error: null } | { session: null; error: NextResponse }
> {
  const session = await getSession(request);
  if (!session) {
    return {
      session: null,
      error: new NextResponse(
        JSON.stringify({ error: 'Unauthorized — session tidak valid atau expired.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }
  return { session, error: null };
}

/**
 * Build Set-Cookie header value for session
 */
export function buildSessionCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const parts = [
    `${AUTH_COOKIE_NAME}=${token}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${SESSION_MAX_AGE}`,
  ];
  if (isProduction) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

/**
 * Build Set-Cookie header to clear session
 */
export function buildLogoutCookie(): string {
  return `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

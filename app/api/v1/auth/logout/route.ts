/**
 * ============================================================================
 * API: POST /api/v1/auth/logout
 * ============================================================================
 * Clear session cookie.
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { buildLogoutCookie } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.headers.set('Set-Cookie', buildLogoutCookie());
  return response;
}

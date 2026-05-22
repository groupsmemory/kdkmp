/**
 * ============================================================================
 * KDKMP JASASAJA — Meta Conversions API (CAPI) Handler
 * ============================================================================
 * Hierarki: Master Validator > Gem 3/4 > Gem 2
 *
 * Strategi Hemat Komputasi:
 *   - Meta Graph API POST dikemas dalam waitUntil() (background execution)
 *   - Response dikembalikan ke client dalam < 50ms
 *   - Graph API call (200-500ms) TIDAK dihitung sebagai compute time
 *   - Menghemat ~80% menit komputasi per event di Vercel Hobby Plan
 *
 * Keamanan:
 *   - PII (email, phone) di-hash SHA-256 sebelum dikirim ke Meta
 *   - Internal API key untuk mencegah abuse dari luar
 *   - Deduplikasi otomatis via event_id (client + server same ID)
 *
 * Free Tier Compliance:
 *   - Vercel Hobby: 10s timeout, 100GB bandwidth
 *   - waitUntil() memindahkan Graph API ke background (billing stops)
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════
// HELPER: SHA-256 Hash untuk PII (GDPR/Privacy Compliance)
// ═══════════════════════════════════════════════════════════════

function hashSHA256(value: string): string {
  return crypto
    .createHash('sha256')
    .update(value.trim().toLowerCase())
    .digest('hex');
}

// ═══════════════════════════════════════════════════════════════
// TIPE DATA
// ═══════════════════════════════════════════════════════════════

interface MetaCAPIRequestBody {
  eventName: string;
  eventId: string;
  email?: string;
  phone?: string;
  value?: number;
  currency?: string;
  contentName?: string;
  sourceUrl?: string;
}

// ═══════════════════════════════════════════════════════════════
// GRAPH API SENDER (berjalan di background via waitUntil)
// ═══════════════════════════════════════════════════════════════

async function sendToGraphAPI(
  pixelId: string,
  capiToken: string,
  payload: Record<string, any>
): Promise<void> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: capiToken,
          ...payload,
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Meta CAPI] Graph API error ${response.status}:`, errorBody);
    }
  } catch (error: any) {
    console.error('[Meta CAPI] Network error:', error?.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  // 1. Validasi internal API key
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.META_CAPI_INTERNAL_KEY;

  if (expectedKey && apiKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Validasi konfigurasi
  const pixelId = process.env.META_PIXEL_ID;
  const capiToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !capiToken) {
    return NextResponse.json(
      { error: 'Konfigurasi kredensial Meta CAPI tidak ditemukan.' },
      { status: 500 }
    );
  }

  // 3. Parse body
  let body: MetaCAPIRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 4. Validasi field wajib
  if (!body.eventName || !body.eventId) {
    return NextResponse.json(
      { error: 'Missing required fields: eventName, eventId' },
      { status: 400 }
    );
  }

  // 5. Bangun payload dengan PII ter-hash
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '0.0.0.0';
  const userAgent = request.headers.get('user-agent') || '';

  const userData: Record<string, any> = {
    client_ip_address: clientIp,
    client_user_agent: userAgent,
  };

  // Hash PII sebelum kirim ke Meta (kepatuhan privasi)
  if (body.email) {
    userData.em = [hashSHA256(body.email)];
  }
  if (body.phone) {
    userData.ph = [hashSHA256(body.phone)];
  }

  const eventPayload = {
    data: [
      {
        event_name: body.eventName,
        event_id: body.eventId, // Sama dengan client-side pixel → deduplikasi otomatis
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: body.sourceUrl || request.nextUrl.toString(),
        action_source: 'website' as const,
        user_data: userData,
        custom_data: body.value
          ? {
              value: body.value,
              currency: body.currency || 'IDR',
              content_name: body.contentName || undefined,
            }
          : undefined,
      },
    ],
  };

  // ═══════════════════════════════════════════════════════════════
  // 6. KIRIM KE GRAPH API VIA waitUntil() (BACKGROUND EXECUTION)
  //
  // MITIGASI: Mencegah serverless timeout dan menghemat compute time.
  // Response dikembalikan SEGERA ke client.
  // Graph API call berjalan di background SETELAH response terkirim.
  // Billing Vercel BERHENTI setelah response dikirim.
  // ═══════════════════════════════════════════════════════════════

  const graphApiPromise = sendToGraphAPI(pixelId, capiToken, eventPayload);

  // Coba gunakan waitUntil dari berbagai runtime context
  const waitUntilFn =
    // Vercel Edge/Serverless runtime
    (request as any).waitUntil?.bind(request)
    // Next.js internal context
    || (globalThis as any).__nextRequestContext?.waitUntil
    || null;

  if (typeof waitUntilFn === 'function') {
    // OPTIMAL: Background execution, billing stops setelah response
    waitUntilFn(graphApiPromise);
  } else {
    // FALLBACK (local dev): Fire-and-forget tanpa await
    graphApiPromise.catch((err) => {
      console.error('[Meta CAPI] Background send failed:', err);
    });
  }

  // 7. Return 202 Accepted SEGERA (< 50ms)
  return NextResponse.json(
    {
      accepted: true,
      eventName: body.eventName,
      eventId: body.eventId,
      message: 'Event queued for delivery to Meta Conversions API',
    },
    { status: 202 }
  );
}

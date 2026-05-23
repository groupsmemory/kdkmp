'use client';

/**
 * ============================================================================
 * KDKMP JASASAJA — Meta Pixel (Client-Side)
 * ============================================================================
 * Embed Meta Pixel di halaman publik.
 * Event tracking dengan event_id yang sama untuk deduplikasi CAPI.
 *
 * Deduplikasi:
 *   - Client: fbq('track', 'PageView', {}, { eventID: 'xxx' })
 *   - Server: POST /api/v1/meta-capi { eventId: 'xxx' }
 *   - Meta otomatis deduplikasi berdasarkan event_id yang sama
 * ============================================================================
 */

import { useEffect } from 'react';
import Script from 'next/script';

// ═══════════════════════════════════════════════════════════════
// META PIXEL COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  // Jangan render jika pixel ID belum dikonfigurasi
  if (!pixelId) return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// EVENT TRACKER (Client + Server Dedup)
// ═══════════════════════════════════════════════════════════════

/**
 * Track event ke Meta Pixel (client) + CAPI (server) dengan event_id yang sama.
 * Ini memastikan deduplikasi otomatis di Meta.
 */
export async function trackMetaEvent(params: {
  eventName: string;
  value?: number;
  currency?: string;
  contentName?: string;
}) {
  const eventId = crypto.randomUUID();

  // 1. Client-side: Meta Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', params.eventName, {
      value: params.value,
      currency: params.currency || 'IDR',
      content_name: params.contentName,
    }, { eventID: eventId });
  }

  // 2. Server-side: CAPI (fire-and-forget)
  try {
    fetch('/api/v1/meta-capi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_META_CAPI_KEY || '',
      },
      body: JSON.stringify({
        eventName: params.eventName,
        eventId,
        value: params.value,
        currency: params.currency || 'IDR',
        contentName: params.contentName,
        sourceUrl: window.location.href,
      }),
    }).catch(() => {
      // Non-blocking: jangan crash jika CAPI gagal
    });
  } catch {
    // Silent fail
  }
}

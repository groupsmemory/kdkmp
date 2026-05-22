/**
 * ============================================================================
 * API: POST /api/v1/pos/create-payment
 * ============================================================================
 * Membuat invoice pembayaran Xendit (QRIS/VA) untuk transaksi POS.
 * Client akan menerima payment URL/QR code untuk ditampilkan ke pembeli.
 *
 * Flow:
 *   1. Client kirim amount + items → API buat Xendit Invoice
 *   2. Xendit return invoice_url + qr_string
 *   3. Client tampilkan QR ke pembeli
 *   4. Pembeli bayar → Xendit kirim webhook → /api/v1/webhook/xendit
 *
 * Dilindungi: Auth + Rate Limiting + Idempotency
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';

// ═══════════════════════════════════════════════════════════════
// VALIDASI INPUT
// ═══════════════════════════════════════════════════════════════

const CreatePaymentSchema = z.object({
  amount: z.number().positive().min(1000), // Minimum Rp1.000
  description: z.string().min(1),
  items: z.array(z.object({
    name: z.string(),
    qty: z.number().int().positive(),
    price: z.number().positive(),
  })).min(1),
});

// ═══════════════════════════════════════════════════════════════
// ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  // 0. Verify authentication
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  const { session } = auth;

  // 1. Parse & validate
  let body: z.infer<typeof CreatePaymentSchema>;
  try {
    const raw = await request.json();
    body = CreatePaymentSchema.parse(raw);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Input tidak valid', details: message },
      { status: 400 }
    );
  }

  // 2. Check Xendit API key
  const xenditSecretKey = process.env.XENDIT_SECRET_KEY;
  if (!xenditSecretKey) {
    return NextResponse.json(
      { error: 'Payment gateway belum dikonfigurasi.' },
      { status: 503 }
    );
  }

  // 3. Generate external_id (format: tenantId:idempotencyKey)
  const idempotencyKey = request.headers.get('x-idempotency-key') || crypto.randomUUID();
  const externalId = `${session.tenantId}:${idempotencyKey}`;

  // 4. Create Xendit Invoice
  try {
    const xenditResponse = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(xenditSecretKey + ':')}`,
      },
      body: JSON.stringify({
        external_id: externalId,
        amount: body.amount,
        description: body.description,
        currency: 'IDR',
        payment_methods: ['QRIS', 'OVO', 'DANA', 'SHOPEEPAY'],
        invoice_duration: 900, // 15 menit
        customer: {
          given_names: session.name,
        },
        items: body.items.map((item) => ({
          name: item.name,
          quantity: item.qty,
          price: item.price,
        })),
        success_redirect_url: `${process.env.APP_URL || 'https://jasasaja.co.id'}/pos?payment=success`,
        failure_redirect_url: `${process.env.APP_URL || 'https://jasasaja.co.id'}/pos?payment=failed`,
      }),
    });

    if (!xenditResponse.ok) {
      const errorData = await xenditResponse.json().catch(() => ({}));
      console.error('[Create Payment] Xendit error:', xenditResponse.status, errorData);
      return NextResponse.json(
        { error: 'Gagal membuat invoice pembayaran.' },
        { status: 502 }
      );
    }

    const invoice = await xenditResponse.json();

    return NextResponse.json({
      success: true,
      invoiceId: invoice.id,
      invoiceUrl: invoice.invoice_url,
      externalId: externalId,
      amount: body.amount,
      expiresAt: invoice.expiry_date,
    }, { status: 201 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Create Payment] Error:', message);
    return NextResponse.json(
      { error: 'Gagal menghubungi payment gateway.' },
      { status: 502 }
    );
  }
}

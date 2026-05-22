/**
 * ============================================================================
 * API: GET /api/v1/laporan?type=jurnal|neraca|laba-rugi&period=2025-01
 * ============================================================================
 * Query ledger_entries dan accounts untuk generate laporan keuangan SAK EP.
 * Dilindungi oleh rate limiting (middleware.ts).
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';
import { requireAuth } from '@/lib/auth';

// ═══════════════════════════════════════════════════════════════
// DATABASE POOL
// ═══════════════════════════════════════════════════════════════

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.NEON_DATABASE_URL;
    if (!connectionString) {
      throw new Error('[Laporan API] NEON_DATABASE_URL tidak dikonfigurasi');
    }
    pool = new Pool({ connectionString, max: 3 });
  }
  return pool;
}

// ═══════════════════════════════════════════════════════════════
// ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  // 0. Verify authentication
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  const { session } = auth;

  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type') || 'jurnal';
  const period = searchParams.get('period'); // format: YYYY-MM
  const tenantId = session.tenantId; // from authenticated session

  const db = getPool();
  const client = await db.connect();

  try {
    // Set tenant context untuk RLS (parameterized — anti SQL injection)
    await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [tenantId]);

    // Build date filter
    let dateFilter = '';
    const params: string[] = [tenantId];

    if (period) {
      const [year, month] = period.split('-');
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
      dateFilter = `AND le.created_at >= $2::DATE AND le.created_at <= ($3::DATE + INTERVAL '1 day')`;
      params.push(startDate, endDate);
    }

    if (type === 'jurnal') {
      const result = await client.query(
        `SELECT
          le.id,
          le.transaction_id,
          a.code AS account_code,
          a.name AS account_name,
          a.type AS account_type,
          le.debit,
          le.credit,
          le.created_at,
          t.description AS transaction_description
        FROM ledger_entries le
        JOIN accounts a ON a.id = le.account_id
        JOIN transactions t ON t.id = le.transaction_id
        WHERE le.tenant_id = $1::UUID ${dateFilter}
        ORDER BY le.id DESC
        LIMIT 200`,
        params
      );

      return NextResponse.json({
        type: 'jurnal',
        period: period || 'all',
        entries: result.rows,
        count: result.rows.length,
      });
    }

    if (type === 'neraca') {
      const dateJoinFilter = dateFilter ? `AND le.created_at >= $2::DATE AND le.created_at <= ($3::DATE + INTERVAL '1 day')` : '';
      const result = await client.query(
        `SELECT
          a.type AS account_type,
          a.code AS account_code,
          a.name AS account_name,
          COALESCE(SUM(le.debit), 0) AS total_debit,
          COALESCE(SUM(le.credit), 0) AS total_credit,
          CASE
            WHEN a.type IN ('ASSET', 'EXPENSE') THEN COALESCE(SUM(le.debit), 0) - COALESCE(SUM(le.credit), 0)
            ELSE COALESCE(SUM(le.credit), 0) - COALESCE(SUM(le.debit), 0)
          END AS balance
        FROM accounts a
        LEFT JOIN ledger_entries le ON le.account_id = a.id AND le.tenant_id = $1::UUID ${dateJoinFilter}
        WHERE a.tenant_id = $1::UUID AND a.type IN ('ASSET', 'LIABILITY', 'EQUITY')
        GROUP BY a.type, a.code, a.name
        ORDER BY a.type, a.code`,
        params
      );

      return NextResponse.json({
        type: 'neraca',
        period: period || 'all',
        accounts: result.rows,
      });
    }

    if (type === 'laba-rugi') {
      const dateJoinFilter = dateFilter ? `AND le.created_at >= $2::DATE AND le.created_at <= ($3::DATE + INTERVAL '1 day')` : '';
      const result = await client.query(
        `SELECT
          a.type AS account_type,
          a.code AS account_code,
          a.name AS account_name,
          COALESCE(SUM(le.debit), 0) AS total_debit,
          COALESCE(SUM(le.credit), 0) AS total_credit,
          CASE
            WHEN a.type = 'REVENUE' THEN COALESCE(SUM(le.credit), 0) - COALESCE(SUM(le.debit), 0)
            WHEN a.type = 'EXPENSE' THEN COALESCE(SUM(le.debit), 0) - COALESCE(SUM(le.credit), 0)
            ELSE 0
          END AS balance
        FROM accounts a
        LEFT JOIN ledger_entries le ON le.account_id = a.id AND le.tenant_id = $1::UUID ${dateJoinFilter}
        WHERE a.tenant_id = $1::UUID AND a.type IN ('REVENUE', 'EXPENSE')
        GROUP BY a.type, a.code, a.name
        ORDER BY a.type, a.code`,
        params
      );

      return NextResponse.json({
        type: 'laba-rugi',
        period: period || 'all',
        accounts: result.rows,
      });
    }

    return NextResponse.json({ error: 'Tipe laporan tidak valid' }, { status: 400 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Laporan API] Error:', message);
    return NextResponse.json({ error: 'Gagal mengambil data laporan' }, { status: 500 });
  } finally {
    client.release();
  }
}

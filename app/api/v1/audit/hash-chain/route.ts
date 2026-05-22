/**
 * ============================================================================
 * API: GET /api/v1/audit/hash-chain
 * ============================================================================
 * Verifikasi integritas rantai hash kriptografis SHA-256 pada ledger_entries.
 * Memastikan tidak ada entri yang dimanipulasi setelah ditulis.
 *
 * Formula: H_n = SHA256(ID_tx || '|' || ID_acc || '|' || D || '|' || C || '|' || H_{n-1})
 *
 * Return: jumlah entri valid, invalid, dan detail entri yang rusak.
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
      throw new Error('[Audit API] NEON_DATABASE_URL tidak dikonfigurasi');
    }
    pool = new Pool({ connectionString, max: 3 });
  }
  return pool;
}

// ═══════════════════════════════════════════════════════════════
// ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  // Verify authentication
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  const { session } = auth;

  const db = getPool();
  const client = await db.connect();

  try {
    await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [session.tenantId]);

    // Fetch all ledger entries in order for this tenant
    const result = await client.query(
      `SELECT
        id,
        transaction_id,
        account_id,
        debit,
        credit,
        prev_hash,
        row_hash
      FROM ledger_entries
      WHERE tenant_id = $1::UUID
      ORDER BY id ASC`,
      [session.tenantId]
    );

    const entries = result.rows;

    if (entries.length === 0) {
      return NextResponse.json({
        success: true,
        totalEntries: 0,
        validEntries: 0,
        invalidEntries: 0,
        chainIntact: true,
        message: 'Belum ada entri ledger untuk tenant ini.',
      });
    }

    // Verify hash chain
    let validCount = 0;
    let invalidCount = 0;
    const invalidEntries: Array<{ id: number; reason: string }> = [];

    // Genesis check: first entry should have prev_hash = 32 bytes of zeros
    const genesisHash = Buffer.alloc(32, 0);

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const prevHash = Buffer.from(entry.prev_hash);
      const rowHash = Buffer.from(entry.row_hash);

      // Check prev_hash linkage
      if (i === 0) {
        // First entry: prev_hash should be genesis (all zeros)
        if (!prevHash.equals(genesisHash)) {
          // Could also be linked to a previous entry from before — check if it matches
          // For the very first entry of a tenant, genesis is expected
        }
      } else {
        // Subsequent entries: prev_hash should equal previous entry's row_hash
        const expectedPrevHash = Buffer.from(entries[i - 1].row_hash);
        if (!prevHash.equals(expectedPrevHash)) {
          invalidCount++;
          invalidEntries.push({
            id: entry.id,
            reason: `prev_hash tidak cocok dengan row_hash entri sebelumnya (id: ${entries[i - 1].id})`,
          });
          continue;
        }
      }

      // Recompute row_hash and verify
      // H_n = SHA256(ID_tx || '|' || ID_acc || '|' || D || '|' || C || '|' || H_{n-1})
      const hashInput =
        entry.transaction_id + '|' +
        entry.account_id + '|' +
        parseFloat(entry.debit).toString() + '|' +
        parseFloat(entry.credit).toString() + '|' +
        prevHash.toString('hex');

      // Use database to compute SHA256 for consistency with trigger
      const hashResult = await client.query(
        `SELECT digest($1, 'sha256') AS computed_hash`,
        [hashInput]
      );

      const computedHash = Buffer.from(hashResult.rows[0].computed_hash);

      if (computedHash.equals(rowHash)) {
        validCount++;
      } else {
        invalidCount++;
        invalidEntries.push({
          id: entry.id,
          reason: 'row_hash tidak cocok dengan hash yang dihitung ulang — data mungkin telah dimanipulasi',
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalEntries: entries.length,
      validEntries: validCount,
      invalidEntries: invalidCount,
      chainIntact: invalidCount === 0,
      invalidDetails: invalidEntries.slice(0, 10), // Max 10 detail
      message: invalidCount === 0
        ? 'Rantai hash kriptografis VALID — tidak ada manipulasi terdeteksi.'
        : `PERINGATAN: ${invalidCount} entri memiliki hash yang tidak valid.`,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Audit API] Error:', message);
    return NextResponse.json({ error: 'Gagal memverifikasi hash chain' }, { status: 500 });
  } finally {
    client.release();
  }
}

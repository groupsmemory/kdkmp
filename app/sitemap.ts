/**
 * ============================================================================
 * KDKMP JASASAJA — Dynamic XML Sitemap (Scalable to 30.000 Gerai)
 * ============================================================================
 * Hierarki: Master Validator > Gem 3/4 > Gem 2
 *
 * Strategi:
 *   - Menggunakan Next.js MetadataRoute untuk generate sitemap.xml
 *   - Query dibatasi dengan LIMIT/OFFSET chunking untuk mencegah timeout
 *   - Vercel Hobby Plan: 10s function timeout → batch 1000 rows per query
 *   - Saat ini: 189 gerai Pamekasan (well within limits)
 *   - Skalabilitas: siap untuk 30.000 gerai nasional via pagination
 *
 * Free Tier Compliance:
 *   - NeonDB Free: query ringan dengan LIMIT
 *   - Vercel Hobby: sitemap di-generate saat build (ISR) atau on-demand
 *   - Tidak memicu compute berlebihan
 * ============================================================================
 */

import { MetadataRoute } from 'next';
import { Pool } from '@neondatabase/serverless';

const BATCH_SIZE = 1000; // Chunk size untuk mencegah Vercel timeout
const BASE_URL = 'https://jasasaja.co.id';

export default async function sitemap(): Promise<MetadataRoute['sitemap']> {
  const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    max: 2, // Minimal koneksi untuk sitemap generation
  });

  const routes: MetadataRoute['sitemap'] = [];

  // ─────────────────────────────────────────────────────────────
  // Static routes (selalu ada)
  // ─────────────────────────────────────────────────────────────
  routes.push(
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/kalkulator-shu`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    }
  );

  // ─────────────────────────────────────────────────────────────
  // Dynamic routes: Programmatic SEO pages per gerai
  // Menggunakan batched query untuk skalabilitas 30.000 gerai
  // ─────────────────────────────────────────────────────────────
  try {
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const result = await pool.query(
        `SELECT LOWER(subdistrict) as subdistrict,
                LOWER(village) as village,
                created_at
         FROM tenants
         WHERE is_active = TRUE
         ORDER BY region, subdistrict, village
         LIMIT $1 OFFSET $2`,
        [BATCH_SIZE, offset]
      );

      for (const row of result.rows) {
        routes.push({
          url: `${BASE_URL}/pamekasan/${row.subdistrict}/${row.village}`,
          lastModified: new Date(row.created_at),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }

      // Cek apakah masih ada data
      if (result.rows.length < BATCH_SIZE) {
        hasMore = false;
      } else {
        offset += BATCH_SIZE;
      }
    }
  } catch (error) {
    console.error('[Sitemap] Database query error:', error);
    // Return static routes saja jika DB gagal
  } finally {
    await pool.end();
  }

  return routes;
}

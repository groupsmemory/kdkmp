require('dotenv').config({ path: '.env.local' });
const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, max: 2 });

async function run() {
  const r = await pool.query(
    `SELECT COUNT(*) as total, COUNT(DISTINCT subdistrict) as kecamatan FROM tenants WHERE region = 'Pamekasan'`
  );
  console.log('Total tenants Pamekasan:', r.rows[0].total);
  console.log('Jumlah kecamatan:', r.rows[0].kecamatan);

  const byKec = await pool.query(
    `SELECT subdistrict, COUNT(*) as count FROM tenants WHERE region = 'Pamekasan' GROUP BY subdistrict ORDER BY subdistrict`
  );
  console.log('\nPer kecamatan:');
  byKec.rows.forEach(row => console.log(`  ${row.subdistrict}: ${row.count} gerai`));

  await pool.end();
}
run();

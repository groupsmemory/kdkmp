/**
 * Migration runner — executes SQL files against NeonDB
 * Usage: node db/run-migration.js [schema|001]
 */
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, max: 2 });

async function run() {
  const arg = process.argv[2] || 'schema';
  
  let sqlFile;
  if (arg === 'schema') {
    sqlFile = path.join(__dirname, 'schema.sql');
  } else {
    sqlFile = path.join(__dirname, 'migrations', `${arg}_create_users.sql`);
    if (!fs.existsSync(sqlFile)) {
      sqlFile = path.join(__dirname, 'migrations', arg + '.sql');
    }
  }

  if (!fs.existsSync(sqlFile)) {
    console.error(`File not found: ${sqlFile}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlFile, 'utf8');
  console.log(`Running: ${sqlFile}`);
  console.log(`SQL length: ${sql.length} chars`);

  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('✓ Migration completed successfully');
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    if (error.detail) console.error('  Detail:', error.detail);
    if (error.hint) console.error('  Hint:', error.hint);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();

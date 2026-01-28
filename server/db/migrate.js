import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/**
 * Run all pending database migrations
 * @param {Pool} pool - PostgreSQL connection pool
 */
export async function runMigrations(pool) {
  console.log('Running database migrations...');

  // Create migrations tracking table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Get list of already executed migrations
  const { rows: executed } = await pool.query('SELECT name FROM _migrations ORDER BY name');
  const executedMigrations = new Set(executed.map(row => row.name));

  // Get all migration files
  const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();

  let migrationsRun = 0;

  for (const file of migrationFiles) {
    if (executedMigrations.has(file)) {
      console.log(`  ✓ ${file} (already applied)`);
      continue;
    }

    console.log(`  → Running ${file}...`);

    try {
      const migrationSQL = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

      // Run migration in a transaction
      await pool.query('BEGIN');
      await pool.query(migrationSQL);
      await pool.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      await pool.query('COMMIT');

      console.log(`  ✓ ${file} applied successfully`);
      migrationsRun++;
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error(`  ✗ ${file} failed:`, error.message);
      throw error;
    }
  }

  if (migrationsRun === 0) {
    console.log('No new migrations to run');
  } else {
    console.log(`Successfully ran ${migrationsRun} migration(s)`);
  }
}

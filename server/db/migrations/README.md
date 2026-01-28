# Database Migrations

This directory contains database migration scripts for the Investment Tracker application.

## Automatic Migrations

Migrations run automatically when the API server starts. The system:

1. Creates a `_migrations` table to track which migrations have been applied
2. Scans this directory for `.sql` files
3. Runs any migrations that haven't been executed yet (in alphabetical order)
4. Records successful migrations to prevent re-running

No manual intervention required - just pull the code and restart the server.

## Creating New Migrations

1. Create a new `.sql` file with a numeric prefix for ordering:
   ```
   002_add_new_feature.sql
   003_update_table.sql
   ```

2. Write idempotent SQL when possible (use `IF NOT EXISTS`, `IF EXISTS` checks)

3. The migration will run automatically on next server start

## Available Migrations

### 001_add_advice_column.sql
Adds an `advice` column to the `holdings` table to track investment recommendations (Buy/Sell/Keep).

- **Purpose**: Store investment advice for each holding based on performance metrics
- **Logic**:
  - Buy: Gain/Loss < -10% (potential buying opportunity)
  - Sell: Gain/Loss > 30% (take profits) OR (Gain/Loss < -5% AND dividend_yield < 1%)
  - Keep: Everything else (stable performance)

## Manual Migration (if needed)

If you need to run migrations manually:

```bash
# Using Docker
docker exec -it investment-tracker-api node -e "
  import('./db/migrate.js').then(m => {
    import('./db/connection.js').then(c => m.runMigrations(c.default))
  })
"
```

Or connect directly to the database:

```bash
docker exec -it investment-tracker-db psql -U postgres -d investment_tracker -f /path/to/migration.sql
```

## Notes

- Migrations run inside a transaction - if one fails, it rolls back
- Failed migrations do not get recorded, so they'll retry on next startup
- The `_migrations` table tracks execution history

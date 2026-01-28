# Database Migrations

This directory contains database migration scripts for the Investment Tracker application.

## Available Migrations

### 001_add_advice_column.sql
Adds an `advice` column to the `holdings` table to track investment recommendations (Buy/Sell/Keep).

- **Purpose**: Store investment advice for each holding based on performance metrics
- **Logic**: 
  - Buy: Gain/Loss < -10% (potential buying opportunity)
  - Sell: Gain/Loss > 30% (take profits) OR (Gain/Loss < -5% AND dividend_yield < 1%)
  - Keep: Everything else (stable performance)

## Running Migrations

For existing databases, you can run migrations manually using psql:

```bash
# Connect to your database
psql -U postgres -d investment_tracker

# Run a specific migration
\i /path/to/server/db/migrations/001_add_advice_column.sql
```

Or using Docker:

```bash
# Copy migration to container
docker cp server/db/migrations/001_add_advice_column.sql investment-tracker-db:/tmp/

# Execute migration
docker exec -it investment-tracker-db psql -U postgres -d investment_tracker -f /tmp/001_add_advice_column.sql
```

## Notes

- Migrations are idempotent - they check if changes already exist before applying
- The `init.sql` file includes all schema changes for fresh installations
- For existing installations, run migrations in numerical order

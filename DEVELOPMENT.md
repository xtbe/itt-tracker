# Development Context

## Project Overview
Investment Portfolio Tracker - A multi-currency portfolio management application with React frontend, Express.js backend, and PostgreSQL database.

## Current Implementation Status

### Completed Features
- ✅ Component-based React architecture (8 modular components)
- ✅ Express.js backend with PostgreSQL database
- ✅ Full Docker setup (3 services: postgres, api, frontend)
- ✅ Account management (create, delete, filter)
- ✅ Holdings tracking with cost basis and performance metrics
- ✅ Cash balance management across multiple currencies
- ✅ Multi-currency support (11 currencies: USD, EUR, GBP, JPY, CHF, CAD, AUD, BRL, INR, NZD, TRY)
- ✅ Live exchange rate integration via Frankfurter API
- ✅ Three-tier caching for exchange rates (memory → database → API)
- ✅ Historical exchange rate storage (one record per day per currency)
- ✅ Background job for automatic rate fetching (runs on startup + every 6 hours)
- ✅ Exchange rate comparison indicators (shows rate changes vs previous day)
- ✅ Base currency persistence via localStorage

### Technology Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- Lucide React for icons
- localStorage for user preferences

**Backend:**
- Node.js 20 with Express.js
- PostgreSQL 16 with JSONB support
- pg library for database connection
- CORS enabled for frontend communication

**Infrastructure:**
- Docker Compose for orchestration
- Nginx for frontend serving and API proxying
- Background jobs using setInterval

### Database Schema

**Tables:**
1. `accounts` - User accounts with currency and optional account number
2. `holdings` - Investment holdings (stocks, ETFs, bonds, etc.)
3. `cash_balances` - Cash balances per account per currency (unique constraint)
4. `exchange_rates` - Historical FX rates (one record per day per base currency, JSONB rates column)

**Indexes:**
- Performance indexes on account_id fields
- Composite index on (base_currency, rate_date) for exchange rates

### Key Architecture Decisions

**Exchange Rate Strategy:**
- Primary source: Frankfurter API (free, ECB data)
- Fallback: Mock data hardcoded in application
- Caching: 1-hour in-memory cache → database → API
- Storage: Automatic background job fetches all currencies daily

**Component Structure:**
```
src/
├── components/
│   ├── Header.jsx - App header with currency selector and refresh button
│   ├── PortfolioSummary.jsx - Total value, cost, gain/loss, dividends
│   ├── CashBalances.jsx - Cash balances display with currency conversion
│   ├── AccountFilter.jsx - Account filtering buttons with delete option
│   ├── HoldingsTable.jsx - Holdings display with performance metrics
│   ├── AddAccountModal.jsx - Account creation form
│   ├── AddHoldingModal.jsx - Holding creation form
│   ├── AddCashModal.jsx - Cash transaction form
│   └── FXRatesModal.jsx - Exchange rates display with historical comparison
├── services/
│   └── api.js - API client for backend communication
├── utils/
│   ├── calculations.js - Portfolio calculation functions
│   └── constants.js - Application constants
└── App.jsx - Main orchestrating component
```

**Backend Structure:**
```
server/
├── routes/
│   ├── accounts.js - Account CRUD endpoints
│   ├── holdings.js - Holdings CRUD endpoints
│   ├── cashBalances.js - Cash balance CRUD endpoints
│   └── fxRates.js - FX rates endpoints (current + history)
├── jobs/
│   └── fetchRates.js - Background job for automatic rate fetching
├── db/
│   ├── connection.js - PostgreSQL connection pool
│   └── init.sql - Database initialization script
├── middleware/
│   └── errorHandler.js - Error handling middleware
└── index.js - Express server entry point
```

### API Endpoints

**Accounts:**
- GET /api/accounts
- POST /api/accounts
- PUT /api/accounts/:id
- DELETE /api/accounts/:id (cascade deletes holdings and cash)

**Holdings:**
- GET /api/holdings?accountId=X
- POST /api/holdings
- PUT /api/holdings/:id
- DELETE /api/holdings/:id

**Cash Balances:**
- GET /api/cash-balances?accountId=X
- POST /api/cash-balances
- DELETE /api/cash-balances/:id

**FX Rates:**
- GET /api/fx-rates?base=USD
- GET /api/fx-rates/history?base=USD&days=30

### Running the Application

**Development Mode:**

1. Start PostgreSQL:
   ```bash
   docker compose up postgres -d
   ```

2. Start backend server:
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. Start frontend:
   ```bash
   npm install
   npm run dev
   ```

**Production Mode (Docker):**
```bash
docker compose up --build
```

Access at: http://localhost:3000

### Environment Variables

**Backend (.env):**
```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=investment_tracker
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
PORT=3001
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3001/api
```

### Recent Changes

**Latest Session (2026-01-26):**
1. Integrated background job for automatic exchange rate fetching
   - Added startDailyRatesJob() to server startup
   - Fetches all 11 currencies on startup and every 6 hours
   - Prevents duplicate API calls by checking database first

2. Added exchange rate comparison indicators
   - Shows trend icons (↑ green, ↓ red, − gray)
   - Compares current rates with previous day's rates
   - Fetches historical data via /api/fx-rates/history endpoint

3. Enhanced refresh button visibility
   - Added "Refresh" text label to icon-only button
   - Made button more discoverable in header

### Conversation History

The full conversation transcript is available at:
`C:\Users\tom\.claude\projects\c--Users-tom-Downloads-itt\79dbb2a7-f9aa-462a-847d-6d047e475797.jsonl`

To continue development on another device:
1. Copy this DEVELOPMENT.md file (already in repo)
2. Optionally copy the conversation transcript to `docs/conversation-history/`
3. Use this document to understand the current state and architecture

### Known Issues / Future Enhancements

None currently - application is fully functional.

### Tips for Future Development

1. **Exchange Rates**: Historical data accumulates automatically via background job
2. **Database**: All migrations are in init.sql (idempotent - safe to re-run)
3. **Currency Conversion**: All done via convertCurrency() in utils/calculations.js
4. **Deletion**: Account deletion cascades to holdings and cash balances
5. **Caching**: FX rates cached for 1 hour, clear cache by clicking refresh button

### File Reference

**Critical Files:**
- `server/index.js:60` - Background job initialization
- `server/jobs/fetchRates.js` - Automatic rate fetching logic
- `server/routes/fxRates.js` - Three-tier caching implementation
- `server/db/init.sql` - Complete database schema
- `src/App.jsx` - Main state management and data flow
- `src/components/FXRatesModal.jsx` - Exchange rate display with comparisons

---

*Last Updated: 2026-01-26*

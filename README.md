# Investment Portfolio Tracker

A full-stack multi-currency investment portfolio management application with PostgreSQL database, Express.js backend, and React frontend.

## Features

- **Multi-currency support** - 11 currencies (USD, EUR, GBP, JPY, CHF, CAD, AUD, BRL, INR, NZD, TRY)
- **Live exchange rates** - Integration with Frankfurter API (European Central Bank data)
- **Historical rate tracking** - Automatic daily exchange rate storage with comparison indicators
- **Smart caching** - Three-tier caching strategy (memory → database → API)
- **Multiple investment accounts** - Track separate portfolios with account numbers
- **Holdings management** - Stocks, ETFs, bonds, mutual funds with cost basis tracking
- **Investment advice** - Automated Buy/Sell/Keep recommendations based on performance metrics
- **Cash balance management** - Multi-currency cash balances per account
- **Real-time valuation** - Portfolio value with gain/loss calculations
- **Dividend tracking** - Annual dividend yield monitoring
- **Account filtering** - View portfolio by specific accounts or all combined
- **Persistent storage** - PostgreSQL database with automatic initialization
- **Background jobs** - Automatic exchange rate updates every 6 hours

## Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Lucide React Icons

**Backend:**
- Node.js
- Express.js
- PostgreSQL 16
- pg (node-postgres)

**Infrastructure:**
- Docker & Docker Compose
- Nginx (reverse proxy)

## Project Structure

```
.
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── services/          # API client
│   ├── utils/             # Utilities & constants
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── server/                # Backend source
│   ├── db/                # Database connection & init
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   └── index.js           # Server entry point
├── docker-compose.yml     # Docker orchestration
├── Dockerfile             # Frontend Dockerfile
└── nginx.conf             # Nginx configuration
```

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Ports 3000, 3001, and 5432 available

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd itt
   ```

2. (Optional) Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file if you want to customize database credentials.

3. Build and start the application:
   ```bash
   docker-compose up --build
   ```

   This will:
   - Start PostgreSQL database
   - Initialize database tables automatically
   - Start the Express.js backend API
   - Build and serve the React frontend

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

### First Run

The database will be automatically initialized with empty tables on first startup. You can start adding:
1. Accounts (investment accounts, bank accounts, etc.)
2. Holdings (stocks, ETFs, bonds, etc.)
3. Cash balances in different currencies

## Development

### Running Locally (Without Docker)

**Backend:**
```bash
cd server
npm install
# Set up environment variables
export DB_HOST=localhost
export DB_NAME=investment_tracker
export DB_USER=postgres
export DB_PASSWORD=postgres
npm start
```

**Frontend:**
```bash
npm install
npm run dev
```

## API Endpoints

### Accounts
- `GET /api/accounts` - List all accounts
- `POST /api/accounts` - Create account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Holdings
- `GET /api/holdings` - List all holdings
- `GET /api/holdings?accountId=X` - Filter by account
- `POST /api/holdings` - Create holding
- `PUT /api/holdings/:id` - Update holding
- `DELETE /api/holdings/:id` - Delete holding

### Cash Balances
- `GET /api/cash-balances` - List all cash balances
- `POST /api/cash-balances` - Deposit/withdraw cash
- `DELETE /api/cash-balances/:id` - Delete cash balance

### FX Rates
- `GET /api/fx-rates?base=USD` - Get exchange rates (with caching)
- `GET /api/fx-rates/history?base=USD&days=30` - Get historical rates

## Database Schema

### accounts
- `id` - Serial primary key
- `name` - Account name
- `bank` - Bank/institution name
- `type` - Account type (Checking, Savings, Investment, etc.)
- `currency` - Base currency
- `created_at` - Timestamp

### holdings
- `id` - Serial primary key
- `account_id` - Foreign key to accounts
- `symbol` - Ticker symbol
- `name` - Asset name
- `type` - Asset type (Stock, ETF, Bond, etc.)
- `quantity` - Number of shares/units
- `purchase_price` - Average cost per unit
- `current_price` - Current price per unit
- `currency` - Currency
- `dividend_yield` - Annual dividend yield (%)
- `purchase_date` - Purchase date
- `advice` - Investment advice (Buy, Sell, Keep)
- `created_at` - Timestamp

### cash_balances
- `id` - Serial primary key
- `account_id` - Foreign key to accounts
- `currency` - Currency code
- `amount` - Balance amount
- `updated_at` - Timestamp
- Unique constraint on (account_id, currency)

### exchange_rates
- `id` - Serial primary key
- `rate_date` - Date of rates (YYYY-MM-DD)
- `base_currency` - Base currency for rates
- `rates` - JSONB object with all currency rates
- `source` - Data source (Frankfurter API or Mock)
- `created_at` - Timestamp
- Unique constraint on (rate_date, base_currency)

## Stopping the Application

```bash
docker-compose down
```

To remove volumes (database data):
```bash
docker-compose down -v
```

## Development Documentation

For detailed development context, architecture decisions, and conversation history:

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Complete development context, architecture decisions, and current implementation status
- **[ADVICE_FEATURE.md](./docs/ADVICE_FEATURE.md)** - Documentation for the investment advice feature
- **[docs/conversation-history/](./docs/conversation-history/)** - Claude Code conversation transcripts with full development history

These documents are useful for:
- Understanding architectural decisions
- Continuing development on another device
- Onboarding new developers
- Reviewing implementation details
- Learning how to use and customize the advice feature

## License

MIT

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bank VARCHAR(255) NOT NULL,
  account_number VARCHAR(100),
  type VARCHAR(50) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create holdings table
CREATE TABLE IF NOT EXISTS holdings (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  quantity DECIMAL(18, 8) NOT NULL,
  purchase_price DECIMAL(18, 2) NOT NULL,
  current_price DECIMAL(18, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  dividend_yield DECIMAL(5, 2) DEFAULT 0,
  purchase_date DATE NOT NULL,
  advice VARCHAR(20) DEFAULT 'Keep',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create cash_balances table
CREATE TABLE IF NOT EXISTS cash_balances (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
  currency VARCHAR(10) NOT NULL,
  amount DECIMAL(18, 2) NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(account_id, currency)
);

-- Create exchange_rates table for historical FX rates (one record per day per base currency)
CREATE TABLE IF NOT EXISTS exchange_rates (
  id SERIAL PRIMARY KEY,
  rate_date DATE NOT NULL,
  base_currency VARCHAR(10) NOT NULL,
  rates JSONB NOT NULL,
  source VARCHAR(100) DEFAULT 'Frankfurter API (ECB)',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(rate_date, base_currency)
);

-- Create index on account_id for better query performance
CREATE INDEX IF NOT EXISTS idx_holdings_account_id ON holdings(account_id);
CREATE INDEX IF NOT EXISTS idx_cash_balances_account_id ON cash_balances(account_id);

-- Create index on exchange_rates for faster lookups
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON exchange_rates(rate_date DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_base_date ON exchange_rates(base_currency, rate_date DESC);

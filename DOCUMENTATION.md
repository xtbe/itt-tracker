# Investment Portfolio Tracker - Technical Documentation

## Overview
A comprehensive Next.js/React application for tracking multi-currency investment portfolios across multiple accounts and institutions.

## Features Implemented

### 1. Multi-Account Management
- Support for different account types (Checking, Savings, Investment, Retirement, Brokerage)
- Multiple banks/institutions
- Account-level filtering and organization

### 2. Multi-Currency Support
- 7 major currencies supported (USD, EUR, GBP, JPY, CHF, CAD, AUD)
- Real-time FX rate conversion
- Base currency selection for portfolio-wide reporting
- Currency conversion for accurate portfolio valuation

### 3. Asset Tracking
- Multiple asset types: Stocks, ETFs, Bonds, Mutual Funds, Cash
- Key metrics per holding:
  - Symbol/Ticker
  - Quantity
  - Purchase price (cost basis)
  - Current price
  - Purchase date
  - Dividend yield

### 4. Portfolio Analysis
- **Gain/Loss Calculation**: Total and percentage-based
- **Dividend Tracking**: Annual dividend income projections
- **Cost Basis**: Track total investment cost
- **Current Valuation**: Real-time portfolio value
- **Performance Metrics**: Percentage returns per holding

### 5. User Interface
- Responsive design with Tailwind CSS
- Dashboard with summary cards
- Detailed holdings table
- Modal forms for adding accounts and holdings
- Visual indicators for gains/losses
- Clean, professional financial software aesthetic

## Architecture

### Data Models

```typescript
Account {
  id: string
  name: string
  bank: string
  type: AccountType
  currency: Currency
}

Holding {
  id: string
  accountId: string
  symbol: string
  name: string
  type: AssetType
  quantity: number
  purchasePrice: number
  currentPrice: number
  currency: Currency
  dividendYield: number
  purchaseDate: string
}
```

### Key Functions

#### `fetchFXRates(baseCurrency)`
Retrieves exchange rates for currency conversion. Currently using mock data.

**Production Integration:**
```javascript
// Use a real API like exchangerate-api.com
const fetchFXRates = async (baseCurrency) => {
  const response = await fetch(
    `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
  );
  return await response.json();
};
```

#### `convertCurrency(amount, fromCurrency, toCurrency)`
Converts amounts between currencies using current FX rates.

#### `calculateHoldingMetrics(holding)`
Calculates key metrics for a single holding:
- Total cost (quantity × purchase price)
- Current value (quantity × current price)
- Gain/loss (absolute and percentage)
- Annual dividend income

#### `getPortfolioSummary()`
Aggregates portfolio-wide metrics across all holdings (or filtered by account).

## Setup Instructions

### 1. Create Next.js Project
```bash
npx create-next-app@latest investment-tracker
cd investment-tracker
```

### 2. Install Dependencies
```bash
npm install lucide-react
```

### 3. Configure Tailwind CSS
Already included in Next.js 13+ by default. Ensure `tailwind.config.js` includes:
```javascript
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 4. Add Component
Place the `investment-tracker.jsx` file in:
- `app/page.jsx` (App Router), or
- `pages/index.jsx` (Pages Router)

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

## Production Enhancements

### 1. Database Integration
Replace in-memory state with a database:

```javascript
// Example with Prisma ORM
// schema.prisma
model Account {
  id       String    @id @default(cuid())
  name     String
  bank     String
  type     String
  currency String
  holdings Holding[]
}

model Holding {
  id            String   @id @default(cuid())
  accountId     String
  symbol        String
  name          String
  type          String
  quantity      Float
  purchasePrice Float
  currentPrice  Float
  currency      String
  dividendYield Float
  purchaseDate  DateTime
  account       Account  @relation(fields: [accountId], references: [id])
}
```

### 2. Real-Time Price Updates
Integrate with financial data APIs:

**Alpha Vantage:**
```javascript
const fetchStockPrice = async (symbol) => {
  const response = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=YOUR_API_KEY`
  );
  const data = await response.json();
  return parseFloat(data['Global Quote']['05. price']);
};
```

**Yahoo Finance (via RapidAPI):**
```javascript
const fetchStockData = async (symbol) => {
  const response = await fetch(
    `https://yh-finance.p.rapidapi.com/stock/v2/get-summary?symbol=${symbol}`,
    {
      headers: {
        'X-RapidAPI-Key': 'YOUR_API_KEY',
        'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com'
      }
    }
  );
  return await response.json();
};
```

### 3. Authentication
Add user authentication with NextAuth.js:

```bash
npm install next-auth
```

```javascript
// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
};

export default NextAuth(authOptions);
```

### 4. Real FX Rate API
Replace mock FX rates:

```javascript
const fetchFXRates = async (baseCurrency) => {
  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
    );
    const data = await response.json();
    return {
      base: data.base,
      rates: data.rates,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('FX rate fetch failed:', error);
    // Return fallback rates
  }
};
```

### 5. Advanced Features to Add

**Historical Performance:**
```javascript
const trackPerformance = {
  daily: [],
  monthly: [],
  yearly: []
};

// Chart with recharts
import { LineChart, Line, XAxis, YAxis } from 'recharts';
```

**Asset Allocation:**
```javascript
const calculateAllocation = (holdings) => {
  const byType = holdings.reduce((acc, h) => {
    const value = h.quantity * h.currentPrice;
    acc[h.type] = (acc[h.type] || 0) + value;
    return acc;
  }, {});
  
  return Object.entries(byType).map(([type, value]) => ({
    type,
    value,
    percentage: (value / totalPortfolioValue) * 100
  }));
};
```

**Tax Loss Harvesting:**
```javascript
const identifyTaxLossOpportunities = (holdings) => {
  return holdings
    .filter(h => {
      const metrics = calculateHoldingMetrics(h);
      return metrics.gainLoss < 0;
    })
    .sort((a, b) => {
      const aLoss = calculateHoldingMetrics(a).gainLoss;
      const bLoss = calculateHoldingMetrics(b).gainLoss;
      return aLoss - bLoss; // Sort by largest loss
    });
};
```

**Rebalancing Suggestions:**
```javascript
const suggestRebalancing = (holdings, targetAllocation) => {
  const currentAllocation = calculateAllocation(holdings);
  const suggestions = [];
  
  Object.entries(targetAllocation).forEach(([type, targetPercent]) => {
    const current = currentAllocation.find(a => a.type === type);
    const currentPercent = current?.percentage || 0;
    const diff = targetPercent - currentPercent;
    
    if (Math.abs(diff) > 1) { // More than 1% deviation
      suggestions.push({
        type,
        action: diff > 0 ? 'buy' : 'sell',
        amountPercent: Math.abs(diff)
      });
    }
  });
  
  return suggestions;
};
```

### 6. API Routes
Create API endpoints for data operations:

```javascript
// app/api/holdings/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  const holdings = await prisma.holding.findMany({
    include: { account: true }
  });
  return NextResponse.json(holdings);
}

export async function POST(request) {
  const body = await request.json();
  const holding = await prisma.holding.create({
    data: body
  });
  return NextResponse.json(holding);
}
```

### 7. Environment Variables
Create `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/investments"
NEXT_PUBLIC_ALPHAVANTAGE_API_KEY="your_key"
NEXT_PUBLIC_EXCHANGERATE_API_KEY="your_key"
NEXTAUTH_SECRET="your_secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Testing

### Unit Tests (Jest + React Testing Library)
```javascript
import { render, screen } from '@testing-library/react';
import InvestmentTracker from './investment-tracker';

test('displays portfolio summary', () => {
  render(<InvestmentTracker />);
  expect(screen.getByText('Total Value')).toBeInTheDocument();
});

test('calculates gain/loss correctly', () => {
  const holding = {
    quantity: 10,
    purchasePrice: 100,
    currentPrice: 120
  };
  const metrics = calculateHoldingMetrics(holding);
  expect(metrics.gainLoss).toBe(200);
  expect(metrics.gainLossPercent).toBe(20);
});
```

## Performance Optimizations

1. **Memoization**: Use `useMemo` for expensive calculations
```javascript
const summary = useMemo(() => getPortfolioSummary(), [holdings, baseCurrency]);
```

2. **Lazy Loading**: Split components for faster initial load
```javascript
const HoldingsTable = lazy(() => import('./components/HoldingsTable'));
```

3. **Virtual Scrolling**: For large portfolios
```javascript
import { FixedSizeList } from 'react-window';
```

## Security Considerations

1. **Never store sensitive data in localStorage**
2. **Use HTTPS only in production**
3. **Implement rate limiting on API endpoints**
4. **Validate all user inputs**
5. **Use environment variables for API keys**
6. **Implement CSRF protection**
7. **Sanitize database queries**

## Deployment

### Vercel (Recommended for Next.js)
```bash
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Future Enhancements

1. **Mobile App**: React Native version
2. **PDF Reports**: Generate investment reports
3. **Email Alerts**: Price alerts and portfolio updates
4. **Social Features**: Share portfolio performance (anonymized)
5. **AI Insights**: ML-based investment recommendations
6. **Import/Export**: CSV/Excel import for bulk data entry
7. **Crypto Support**: Track cryptocurrency holdings
8. **Automated Trading**: Integration with brokerage APIs
9. **Tax Documents**: Generate tax forms (1099, etc.)
10. **Goal Tracking**: Set and track investment goals

## License
MIT License - Feel free to use and modify for your needs.

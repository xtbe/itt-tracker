# Investment Advice Feature

## Overview

The Investment Tracker now includes an automated investment advice feature that provides recommendations (Buy/Sell/Keep) for each holding based on performance metrics.

## How It Works

### Automatic Calculation

The advice is automatically calculated based on two key metrics:
1. **Gain/Loss Percentage**: The percentage change from purchase price to current price
2. **Dividend Yield**: The annual dividend yield percentage

### Advice Logic

The system applies the following rules:

#### Buy Recommendation
- **Trigger**: Gain/Loss < -10%
- **Rationale**: The holding has lost more than 10% of its value, which may represent a buying opportunity (averaging down strategy)
- **Visual**: Green badge in the Holdings table

#### Sell Recommendation
- **Trigger**: Either of these conditions:
  - Gain/Loss > 30% (take profits)
  - Gain/Loss < -5% AND Dividend Yield < 1% (poor performer)
- **Rationale**: 
  - Take profits when gains exceed 30%
  - Cut losses on poor performers with low income potential
- **Visual**: Red badge in the Holdings table

#### Keep Recommendation
- **Trigger**: All other cases
- **Rationale**: The holding is performing stably and should be held
- **Visual**: Blue badge in the Holdings table

## Usage

### Viewing Advice

The advice is displayed in the Holdings table as a colored badge:
- **Buy**: Green badge
- **Sell**: Red badge  
- **Keep**: Blue badge

### Manual Override

When adding or editing a holding, you can optionally override the automatic advice calculation:

1. Open the Add/Edit Holding modal
2. Find the "Investment Advice (Optional)" dropdown
3. Select your preferred advice or leave it empty for auto-calculation
4. The system will use your manual selection if provided, otherwise it calculates automatically

### Database Migration

For existing databases:

```bash
# Using Docker
docker cp server/db/migrations/001_add_advice_column.sql investment-tracker-db:/tmp/
docker exec -it investment-tracker-db psql -U postgres -d investment_tracker -f /tmp/001_add_advice_column.sql

# Using psql directly
psql -U postgres -d investment_tracker -f server/db/migrations/001_add_advice_column.sql
```

## Technical Details

### Database Schema

The `advice` column is added to the `holdings` table:
- Type: VARCHAR(20)
- Default: 'Keep'
- Possible values: 'Buy', 'Sell', 'Keep'

### API Changes

The holdings API endpoints now accept and return the `advice` field:
- POST `/api/holdings` - Creates holding with advice
- PUT `/api/holdings/:id` - Updates holding including advice
- GET `/api/holdings` - Returns holdings with advice

### Frontend Components

Modified components:
- `HoldingsTable.jsx` - Displays advice badge
- `AddHoldingModal.jsx` - Includes advice dropdown
- `calculations.js` - Contains `calculateAdvice()` function
- `constants.js` - Defines ADVICE_TYPES array

## Customization

To customize the advice logic, modify the `calculateAdvice()` function in `/src/utils/calculations.js`:

```javascript
export const calculateAdvice = (holding) => {
  const metrics = calculateHoldingMetrics(holding);
  const gainLossPercent = metrics.gainLossPercent;
  const dividendYield = parseFloat(holding.dividend_yield) || 0;

  // Customize these thresholds as needed
  if (gainLossPercent < -10) return 'Buy';
  if (gainLossPercent > 30 || (gainLossPercent < -5 && dividendYield < 1)) return 'Sell';
  return 'Keep';
};
```

## Disclaimer

**Important**: This advice feature is for informational purposes only and should not be considered as financial advice. Always consult with a qualified financial advisor before making investment decisions. The thresholds used are generic examples and may not be suitable for all investment strategies or risk tolerances.

export const calculateHoldingMetrics = (holding) => {
  // Ensure all values are numbers
  const quantity = parseFloat(holding.quantity) || 0;
  let purchasePrice = parseFloat(holding.purchase_price) || 0;
  let currentPrice = parseFloat(holding.current_price) || 0;
  const dividendYield = parseFloat(holding.dividend_yield) || 0;

  // For bonds: price is quoted per 100 nominal (as a percentage)
  // So we need to divide by 100 to get the actual price factor
  const isBond = holding.type && holding.type.toLowerCase() === 'bond';
  if (isBond) {
    purchasePrice = purchasePrice / 100;
    currentPrice = currentPrice / 100;
  }

  const totalCost = quantity * purchasePrice;
  const currentValue = quantity * currentPrice;
  const gainLoss = currentValue - totalCost;
  const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
  const annualDividend = currentValue * (dividendYield / 100);

  return {
    totalCost,
    currentValue,
    gainLoss,
    gainLossPercent,
    annualDividend
  };
};

export const calculateAdvice = (holding) => {
  const metrics = calculateHoldingMetrics(holding);
  const gainLossPercent = metrics.gainLossPercent;
  const dividendYield = parseFloat(holding.dividend_yield) || 0;

  // Investment advice logic based on performance and dividend yield
  // Buy: Significant loss (potential buying opportunity)
  if (gainLossPercent < -10) {
    return 'Buy';
  }
  
  // Sell: High gains (take profits) or poor performer with low yield
  if (gainLossPercent > 30 || (gainLossPercent < -5 && dividendYield < 1)) {
    return 'Sell';
  }
  
  // Keep: Everything else (stable performance)
  return 'Keep';
};

export const convertCurrency = (amount, fromCurrency, toCurrency, fxRates) => {
  if (!fxRates || fromCurrency === toCurrency) return amount;
  const inBase = amount / fxRates.rates[fromCurrency];
  return inBase * fxRates.rates[toCurrency];
};

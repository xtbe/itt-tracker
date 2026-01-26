export const calculateHoldingMetrics = (holding) => {
  const totalCost = holding.quantity * holding.purchase_price;
  const currentValue = holding.quantity * holding.current_price;
  const gainLoss = currentValue - totalCost;
  const gainLossPercent = (gainLoss / totalCost) * 100;
  const annualDividend = currentValue * (holding.dividend_yield / 100);

  return {
    totalCost,
    currentValue,
    gainLoss,
    gainLossPercent,
    annualDividend
  };
};

export const convertCurrency = (amount, fromCurrency, toCurrency, fxRates) => {
  if (!fxRates || fromCurrency === toCurrency) return amount;
  const inBase = amount / fxRates.rates[fromCurrency];
  return inBase * fxRates.rates[toCurrency];
};

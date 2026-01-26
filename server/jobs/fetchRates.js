import pool from '../db/connection.js';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'BRL', 'INR', 'NZD', 'TRY'];

// Mock rates fallback
const mockRates = {
  USD: { USD: 1.0, EUR: 0.92, GBP: 0.79, JPY: 149.50, CHF: 0.88, CAD: 1.36, AUD: 1.52, BRL: 5.0, INR: 83.0, NZD: 1.65, TRY: 32.0 },
  EUR: { USD: 1.09, EUR: 1.0, GBP: 0.86, JPY: 162.50, CHF: 0.96, CAD: 1.48, AUD: 1.65, BRL: 5.45, INR: 90.47, NZD: 1.80, TRY: 34.88 },
  GBP: { USD: 1.27, EUR: 1.16, GBP: 1.0, JPY: 189.00, CHF: 1.11, CAD: 1.72, AUD: 1.92, BRL: 6.35, INR: 105.41, NZD: 2.10, TRY: 40.64 },
  JPY: { USD: 0.0067, EUR: 0.0062, GBP: 0.0053, JPY: 1.0, CHF: 0.0059, CAD: 0.0091, AUD: 0.0102, BRL: 0.0335, INR: 0.555, NZD: 0.011, TRY: 0.214 },
  CHF: { USD: 1.14, EUR: 1.04, GBP: 0.90, JPY: 169.50, CHF: 1.0, CAD: 1.55, AUD: 1.73, BRL: 5.70, INR: 94.62, NZD: 1.88, TRY: 36.48 },
  CAD: { USD: 0.74, EUR: 0.68, GBP: 0.58, JPY: 110.00, CHF: 0.65, CAD: 1.0, AUD: 1.12, BRL: 3.68, INR: 61.03, NZD: 1.21, TRY: 23.53 },
  AUD: { USD: 0.66, EUR: 0.61, GBP: 0.52, JPY: 98.00, CHF: 0.58, CAD: 0.89, AUD: 1.0, BRL: 3.29, INR: 54.58, NZD: 1.09, TRY: 21.05 },
  BRL: { USD: 0.20, EUR: 0.18, GBP: 0.16, JPY: 29.90, CHF: 0.18, CAD: 0.27, AUD: 0.30, BRL: 1.0, INR: 16.60, NZD: 0.33, TRY: 6.40 },
  INR: { USD: 0.012, EUR: 0.011, GBP: 0.0095, JPY: 1.80, CHF: 0.011, CAD: 0.016, AUD: 0.018, BRL: 0.060, INR: 1.0, NZD: 0.020, TRY: 0.386 },
  NZD: { USD: 0.61, EUR: 0.56, GBP: 0.48, JPY: 90.61, CHF: 0.53, CAD: 0.83, AUD: 0.92, BRL: 3.03, INR: 50.30, NZD: 1.0, TRY: 19.39 },
  TRY: { USD: 0.031, EUR: 0.029, GBP: 0.025, JPY: 4.67, CHF: 0.027, CAD: 0.042, AUD: 0.048, BRL: 0.156, INR: 2.59, NZD: 0.052, TRY: 1.0 }
};

// Fetch rates from Frankfurter API
const fetchLiveRates = async (baseCurrency) => {
  try {
    const response = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}`);

    if (!response.ok) {
      throw new Error(`Frankfurter API error: ${response.status}`);
    }

    const data = await response.json();

    const rates = {
      [baseCurrency]: 1.0,
      ...data.rates
    };

    return {
      base: data.base,
      rates: rates,
      timestamp: data.date,
      source: 'Frankfurter API (ECB)'
    };
  } catch (error) {
    console.error(`Error fetching rates for ${baseCurrency}:`, error.message);

    return {
      base: baseCurrency,
      rates: mockRates[baseCurrency] || mockRates.USD,
      timestamp: new Date().toISOString().split('T')[0],
      source: 'Mock Data (Fallback)'
    };
  }
};

// Check if rates exist for a given date and currency
const ratesExistInDB = async (baseCurrency, date) => {
  try {
    const result = await pool.query(
      'SELECT id FROM exchange_rates WHERE base_currency = $1 AND rate_date = $2',
      [baseCurrency, date]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking rates in DB:', error);
    return false;
  }
};

// Store rates in database
const storeRatesInDB = async (baseCurrency, date, rates, source) => {
  try {
    await pool.query(
      `INSERT INTO exchange_rates (rate_date, base_currency, rates, source)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (rate_date, base_currency) DO UPDATE
       SET rates = $3, source = $4, created_at = NOW()`,
      [date, baseCurrency, JSON.stringify(rates), source]
    );
    console.log(`✓ Stored rates for ${baseCurrency} on ${date}`);
  } catch (error) {
    console.error(`✗ Error storing rates for ${baseCurrency}:`, error);
  }
};

// Fetch and store rates for all currencies
export const fetchAllCurrencyRates = async () => {
  const today = new Date().toISOString().split('T')[0];

  console.log(`\n[Background Job] Fetching exchange rates for all currencies (${today})...`);

  let fetchedCount = 0;
  let skippedCount = 0;

  for (const currency of CURRENCIES) {
    try {
      // Check if rates already exist for today
      const exists = await ratesExistInDB(currency, today);

      if (exists) {
        console.log(`  - ${currency}: Already exists, skipping`);
        skippedCount++;
        continue;
      }

      // Fetch rates from API
      console.log(`  - ${currency}: Fetching from API...`);
      const rateData = await fetchLiveRates(currency);

      // Store in database
      await storeRatesInDB(currency, rateData.timestamp, rateData.rates, rateData.source);
      fetchedCount++;

      // Add small delay to avoid hitting API rate limits
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`  - ${currency}: Error -`, error.message);
    }
  }

  console.log(`[Background Job] Complete: ${fetchedCount} fetched, ${skippedCount} skipped\n`);
};

// Schedule daily job
export const startDailyRatesJob = () => {
  console.log('[Background Job] Exchange rates scheduler started');

  // Run immediately on startup
  fetchAllCurrencyRates();

  // Then run every 6 hours (to catch new days in different timezones)
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  setInterval(() => {
    fetchAllCurrencyRates();
  }, SIX_HOURS);
};

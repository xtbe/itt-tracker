import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// In-memory cache for FX rates (for performance within the same request session)
const cache = {
  data: {},
  timestamp: null
};

// Cache duration: 1 hour
const CACHE_DURATION = 60 * 60 * 1000;

// Mock FX Rate data as fallback
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
const fetchLiveRates = async (baseCurrency = 'USD') => {
  try {
    const response = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}`);

    if (!response.ok) {
      throw new Error(`Frankfurter API error: ${response.status}`);
    }

    const data = await response.json();

    // Frankfurter returns rates object, but we need to add the base currency rate (1.0)
    const rates = {
      [baseCurrency]: 1.0,
      ...data.rates
    };

    return {
      base: data.base,
      rates: rates,
      timestamp: data.date, // Frankfurter returns date in YYYY-MM-DD format
      source: 'Frankfurter API (ECB)'
    };
  } catch (error) {
    console.error('Error fetching rates from Frankfurter:', error.message);

    // Fallback to mock data
    return {
      base: baseCurrency,
      rates: mockRates[baseCurrency] || mockRates.USD,
      timestamp: new Date().toISOString().split('T')[0],
      source: 'Mock Data (Fallback)'
    };
  }
};

// Get rates from database for today
const getRatesFromDB = async (baseCurrency, date) => {
  try {
    const result = await pool.query(
      'SELECT rate_date, base_currency, rates, source FROM exchange_rates WHERE base_currency = $1 AND rate_date = $2',
      [baseCurrency, date]
    );

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        base: row.base_currency,
        rates: row.rates,
        timestamp: row.rate_date,
        source: row.source + ' (from DB)'
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching rates from database:', error);
    return null;
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
    console.log(`Stored rates for ${baseCurrency} on ${date} in database`);
  } catch (error) {
    console.error('Error storing rates in database:', error);
  }
};

// Check if in-memory cache is still valid
const isCacheValid = (baseCurrency) => {
  if (!cache.data[baseCurrency] || !cache.timestamp) {
    return false;
  }

  const now = Date.now();
  const age = now - cache.timestamp;

  return age < CACHE_DURATION;
};

// GET FX rates
router.get('/', async (req, res) => {
  const { base = 'USD' } = req.query;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  try {
    // 1. Check in-memory cache first (fastest)
    if (isCacheValid(base)) {
      console.log(`Returning in-memory cached rates for ${base}`);
      return res.json(cache.data[base]);
    }

    // 2. Check database for today's rates
    console.log(`Checking database for ${base} rates on ${today}...`);
    const dbRates = await getRatesFromDB(base, today);

    if (dbRates) {
      console.log(`Found rates for ${base} in database`);
      // Update in-memory cache
      cache.data[base] = dbRates;
      cache.timestamp = Date.now();
      return res.json(dbRates);
    }

    // 3. Fetch fresh rates from API
    console.log(`Fetching fresh rates for ${base} from Frankfurter API...`);
    const liveRates = await fetchLiveRates(base);

    // 4. Store in database for historical tracking
    await storeRatesInDB(base, liveRates.timestamp, liveRates.rates, liveRates.source);

    // 5. Update in-memory cache
    cache.data[base] = liveRates;
    cache.timestamp = Date.now();

    res.json(liveRates);
  } catch (error) {
    console.error('Error in FX rates endpoint:', error);

    // Return fallback mock data
    res.json({
      base,
      rates: mockRates[base] || mockRates.USD,
      timestamp: today,
      source: 'Mock Data (Error Fallback)'
    });
  }
});

// GET historical rates (optional endpoint for future use)
router.get('/history', async (req, res) => {
  const { base = 'USD', days = 30 } = req.query;

  try {
    const result = await pool.query(
      `SELECT rate_date, base_currency, rates, source
       FROM exchange_rates
       WHERE base_currency = $1
       ORDER BY rate_date DESC
       LIMIT $2`,
      [base, parseInt(days)]
    );

    const history = result.rows.map(row => ({
      date: row.rate_date,
      base: row.base_currency,
      rates: row.rates,
      source: row.source
    }));

    res.json(history);
  } catch (error) {
    console.error('Error fetching historical rates:', error);
    res.status(500).json({ error: 'Failed to fetch historical rates' });
  }
});

export default router;

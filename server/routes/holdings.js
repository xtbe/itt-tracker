import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// GET all holdings (with optional accountId filter)
router.get('/', async (req, res, next) => {
  try {
    const { accountId } = req.query;

    let query = 'SELECT * FROM holdings';
    let params = [];

    if (accountId) {
      query += ' WHERE account_id = $1';
      params.push(accountId);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET single holding
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM holdings WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Holding not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST create holding
router.post('/', async (req, res, next) => {
  try {
    const {
      account_id,
      symbol,
      name,
      type,
      quantity,
      purchase_price,
      current_price,
      currency,
      dividend_yield = 0,
      purchase_date,
      advice = 'Keep'
    } = req.body;

    if (!account_id || !symbol || !name || !type || !quantity ||
        purchase_price === undefined || current_price === undefined ||
        !currency || !purchase_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO holdings
       (account_id, symbol, name, type, quantity, purchase_price, current_price, currency, dividend_yield, purchase_date, advice)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [account_id, symbol, name, type, quantity, purchase_price, current_price, currency, dividend_yield, purchase_date, advice]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT update holding
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      symbol,
      name,
      type,
      quantity,
      purchase_price,
      current_price,
      currency,
      dividend_yield,
      purchase_date,
      advice
    } = req.body;

    const result = await pool.query(
      `UPDATE holdings
       SET symbol = $1, name = $2, type = $3, quantity = $4,
           purchase_price = $5, current_price = $6, currency = $7,
           dividend_yield = $8, purchase_date = $9, advice = $10
       WHERE id = $11
       RETURNING *`,
      [symbol, name, type, quantity, purchase_price, current_price, currency, dividend_yield, purchase_date, advice, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Holding not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE holding
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM holdings WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Holding not found' });
    }

    res.json({ message: 'Holding deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

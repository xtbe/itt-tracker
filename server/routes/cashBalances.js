import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// GET all cash balances (with optional accountId filter)
router.get('/', async (req, res, next) => {
  try {
    const { accountId } = req.query;

    let query = 'SELECT * FROM cash_balances';
    let params = [];

    if (accountId) {
      query += ' WHERE account_id = $1';
      params.push(accountId);
    }

    query += ' ORDER BY account_id, currency';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// POST deposit/withdraw cash
router.post('/', async (req, res, next) => {
  try {
    const { account_id, currency, amount } = req.body;

    if (!account_id || !currency || amount === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if this currency already exists for this account
    const existing = await pool.query(
      'SELECT * FROM cash_balances WHERE account_id = $1 AND currency = $2',
      [account_id, currency]
    );

    let result;

    if (existing.rows.length > 0) {
      // Update existing balance
      const newAmount = parseFloat(existing.rows[0].amount) + parseFloat(amount);

      // If balance becomes zero or negative, delete the record
      if (newAmount <= 0) {
        await pool.query(
          'DELETE FROM cash_balances WHERE account_id = $1 AND currency = $2',
          [account_id, currency]
        );
        return res.json({ message: 'Cash balance removed', amount: 0 });
      }

      result = await pool.query(
        'UPDATE cash_balances SET amount = $1, updated_at = NOW() WHERE account_id = $2 AND currency = $3 RETURNING *',
        [newAmount, account_id, currency]
      );
    } else {
      // Create new cash balance
      if (amount <= 0) {
        return res.status(400).json({ error: 'Initial amount must be positive' });
      }

      result = await pool.query(
        'INSERT INTO cash_balances (account_id, currency, amount) VALUES ($1, $2, $3) RETURNING *',
        [account_id, currency, amount]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE cash balance
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM cash_balances WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cash balance not found' });
    }

    res.json({ message: 'Cash balance deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

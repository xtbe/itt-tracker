import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// GET all accounts
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM accounts ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// POST create account
router.post('/', async (req, res, next) => {
  try {
    const { name, bank, account_number, type, currency } = req.body;

    if (!name || !bank || !type || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO accounts (name, bank, account_number, type, currency) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, bank, account_number || null, type, currency]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT update account
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, bank, account_number, type, currency } = req.body;

    const result = await pool.query(
      'UPDATE accounts SET name = $1, bank = $2, account_number = $3, type = $4, currency = $5 WHERE id = $6 RETURNING *',
      [name, bank, account_number || null, type, currency, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE account
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM accounts WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

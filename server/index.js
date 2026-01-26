import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './db/connection.js';
import accountsRouter from './routes/accounts.js';
import holdingsRouter from './routes/holdings.js';
import cashBalancesRouter from './routes/cashBalances.js';
import fxRatesRouter from './routes/fxRates.js';
import errorHandler from './middleware/errorHandler.js';
import { startDailyRatesJob } from './jobs/fetchRates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
async function initializeDatabase() {
  try {
    console.log('Checking database connection...');
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');

    console.log('Initializing database tables...');
    const initSQL = fs.readFileSync(join(__dirname, 'db', 'init.sql'), 'utf8');
    await pool.query(initSQL);
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/accounts', accountsRouter);
app.use('/api/holdings', holdingsRouter);
app.use('/api/cash-balances', cashBalancesRouter);
app.use('/api/fx-rates', fxRatesRouter);

// Error handling middleware
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await initializeDatabase();

    // Start background job to fetch exchange rates
    startDailyRatesJob();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

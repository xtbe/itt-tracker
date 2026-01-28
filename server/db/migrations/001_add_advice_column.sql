-- Migration: Add advice column to holdings table
-- This migration adds an 'advice' column to track investment advice (Buy/Sell/Keep)
-- for each holding based on performance metrics.

-- Add advice column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'holdings' AND column_name = 'advice'
  ) THEN
    ALTER TABLE holdings ADD COLUMN advice VARCHAR(20) DEFAULT 'Keep';
    
    -- Update existing holdings with calculated advice based on performance
    -- This is a one-time calculation for existing data
    UPDATE holdings
    SET advice = CASE
      -- Buy: Significant loss (potential buying opportunity)
      WHEN ((current_price - purchase_price) / NULLIF(purchase_price, 0)) * 100 < -10 THEN 'Buy'
      -- Sell: High gains (take profits) or poor performer with low yield
      WHEN ((current_price - purchase_price) / NULLIF(purchase_price, 0)) * 100 > 30 
           OR (((current_price - purchase_price) / NULLIF(purchase_price, 0)) * 100 < -5 AND dividend_yield < 1) THEN 'Sell'
      -- Keep: Everything else (stable performance)
      ELSE 'Keep'
    END
    WHERE advice IS NULL OR advice = 'Keep';
    
    RAISE NOTICE 'Successfully added advice column to holdings table';
  ELSE
    RAISE NOTICE 'Advice column already exists in holdings table';
  END IF;
END $$;

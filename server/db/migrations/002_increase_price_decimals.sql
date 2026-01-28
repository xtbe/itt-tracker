-- Migration: Increase decimal precision for price columns
-- Changes purchase_price and current_price from DECIMAL(18, 2) to DECIMAL(18, 4)
-- to allow more precision for securities like bonds and crypto

ALTER TABLE holdings
  ALTER COLUMN purchase_price TYPE DECIMAL(18, 4),
  ALTER COLUMN current_price TYPE DECIMAL(18, 4);

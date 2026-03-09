-- Add optional custom display name to user_products
ALTER TABLE user_products ADD COLUMN IF NOT EXISTS nickname TEXT;

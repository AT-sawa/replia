-- 005_memo.sql
-- user_products に自由メモ欄を追加

ALTER TABLE user_products ADD COLUMN IF NOT EXISTS notes TEXT;

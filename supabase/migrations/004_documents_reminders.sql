-- 004_documents_reminders.sql
-- 書類管理 + メンテナンスリマインダー機能

-- user_products に取扱説明書URLカラムを追加
-- (receipt_photo_url, warranty_photo_url は 001_initial.sql で定義済み)
ALTER TABLE user_products ADD COLUMN IF NOT EXISTS manual_url TEXT;

-- tickets テーブルの status CHECK 制約を削除
-- (修理履歴機能で日本語ステータスを使用するため)
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;

-- メンテナンスリマインダーテーブル
CREATE TABLE IF NOT EXISTS maintenance_reminders (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_product_id UUID NOT NULL REFERENCES user_products(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  interval_months INT  NOT NULL DEFAULT 1,
  last_done_date  DATE,
  next_due_date   DATE,
  enabled         BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE maintenance_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reminders_all" ON maintenance_reminders
  FOR ALL
  USING (
    user_product_id IN (SELECT id FROM user_products WHERE user_id = auth.uid())
  )
  WITH CHECK (
    user_product_id IN (SELECT id FROM user_products WHERE user_id = auth.uid())
  );

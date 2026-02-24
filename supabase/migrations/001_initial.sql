-- 001_initial.sql
-- Repliaアプリ 初期スキーマ定義

-- 製品マスター
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_number text NOT NULL,
  jan_code text,
  product_name text NOT NULL,
  manufacturer_name text,
  category text,
  image_url text,
  category_emoji text,
  default_warranty_months integer DEFAULT 12,
  created_at timestamptz DEFAULT now()
);

-- ユーザー登録製品・保証情報
CREATE TABLE IF NOT EXISTS user_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  purchase_date date,
  purchase_store text,
  warranty_start date,
  warranty_end date,
  receipt_photo_url text,
  warranty_photo_url text,
  created_at timestamptz DEFAULT now()
);

-- 会話セッション
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  is_resolved boolean DEFAULT false,
  is_escalated boolean DEFAULT false,
  ai_summary text,
  created_at timestamptz DEFAULT now()
);

-- チャットメッセージ
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  source_reference text,
  created_at timestamptz DEFAULT now()
);

-- エスカレーションチケット
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id),
  user_product_id uuid REFERENCES user_products(id),
  status text DEFAULT 'new' CHECK (status IN ('new','in_progress','resolved','closed')),
  symptom text,
  tried_solutions text,
  warranty_status text,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE user_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets        ENABLE ROW LEVEL SECURITY;

-- RLSポリシー（既存ポリシーが存在する場合はスキップ）
DO $$ BEGIN
  CREATE POLICY "own" ON user_products FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "own" ON conversations FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "own" ON messages FOR ALL USING (
    conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "own" ON tickets FOR ALL USING (
    conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Supabase Storageのバケット作成（レシート・保証書写真用）
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

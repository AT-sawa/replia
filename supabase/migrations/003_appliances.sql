-- User-registered appliances
CREATE TABLE IF NOT EXISTS user_appliances (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appliance_type  TEXT NOT NULL DEFAULT 'その他',
  brand           TEXT NOT NULL DEFAULT '',
  model           TEXT NOT NULL DEFAULT '',
  purchase_date   DATE,
  warranty_months INT  NOT NULL DEFAULT 12,
  store_name      TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_appliances ENABLE ROW LEVEL SECURITY;

-- Each user can only see and manage their own appliances
CREATE POLICY "appliances_all" ON user_appliances
  FOR ALL
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

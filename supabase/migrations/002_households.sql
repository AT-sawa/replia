-- Households (family/roommate sharing groups)
CREATE TABLE IF NOT EXISTS households (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  code       CHAR(6) NOT NULL UNIQUE,
  created_by UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Members
CREATE TABLE IF NOT EXISTS household_members (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role         TEXT NOT NULL DEFAULT 'member', -- 'owner' | 'member'
  joined_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)  -- Each user belongs to at most one household
);

ALTER TABLE households        ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can look up a household by code (needed for joining)
CREATE POLICY "household_select" ON households
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "household_insert" ON households
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Members can see other members in their household
CREATE POLICY "members_select" ON household_members
  FOR SELECT USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "members_insert" ON household_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ==============================================
-- Migration: Knowledge Base Entries
-- Allows businesses to store custom Q&A for AI
-- ==============================================

CREATE TABLE knowledge_base_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category TEXT DEFAULT 'general',
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kb_business_id ON knowledge_base_entries(business_id);
CREATE INDEX idx_kb_business_active ON knowledge_base_entries(business_id, is_active);

-- RLS
ALTER TABLE knowledge_base_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own kb entries" ON knowledge_base_entries
  FOR SELECT USING (
    business_id IN (
      SELECT b.id FROM businesses b
      JOIN users u ON b.user_id = u.id
      WHERE u.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own kb entries" ON knowledge_base_entries
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT b.id FROM businesses b
      JOIN users u ON b.user_id = u.id
      WHERE u.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own kb entries" ON knowledge_base_entries
  FOR UPDATE USING (
    business_id IN (
      SELECT b.id FROM businesses b
      JOIN users u ON b.user_id = u.id
      WHERE u.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own kb entries" ON knowledge_base_entries
  FOR DELETE USING (
    business_id IN (
      SELECT b.id FROM businesses b
      JOIN users u ON b.user_id = u.id
      WHERE u.auth_id = auth.uid()
    )
  );

-- Service role can read for webhook usage
CREATE POLICY "Service can read kb entries" ON knowledge_base_entries
  FOR SELECT USING (true);

-- Updated_at trigger
CREATE TRIGGER set_kb_entries_updated_at
  BEFORE UPDATE ON knowledge_base_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

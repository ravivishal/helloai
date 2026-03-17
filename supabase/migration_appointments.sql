-- ==============================================
-- Migration: Appointments
-- Stores booked appointments with Google Calendar sync
-- ==============================================

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  call_id UUID REFERENCES calls(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  appointment_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  service_requested TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  google_event_id TEXT,
  google_calendar_synced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_business_id ON appointments(business_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_business_date ON appointments(business_id, appointment_date);
CREATE INDEX idx_appointments_call_id ON appointments(call_id);

-- RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (
    business_id IN (
      SELECT b.id FROM businesses b
      JOIN users u ON b.user_id = u.id
      WHERE u.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own appointments" ON appointments
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT b.id FROM businesses b
      JOIN users u ON b.user_id = u.id
      WHERE u.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (
    business_id IN (
      SELECT b.id FROM businesses b
      JOIN users u ON b.user_id = u.id
      WHERE u.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own appointments" ON appointments
  FOR DELETE USING (
    business_id IN (
      SELECT b.id FROM businesses b
      JOIN users u ON b.user_id = u.id
      WHERE u.auth_id = auth.uid()
    )
  );

-- Service role can insert from webhooks
CREATE POLICY "Service can insert appointments" ON appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can read appointments" ON appointments
  FOR SELECT USING (true);

CREATE POLICY "Service can update appointments" ON appointments
  FOR UPDATE USING (true);

-- Updated_at trigger
CREATE TRIGGER set_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==============================================
-- Add Google Calendar columns to businesses table
-- ==============================================
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS google_calendar_connected BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS google_calendar_id TEXT DEFAULT 'primary';

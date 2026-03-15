-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- Table: users
-- ==========================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- Table: businesses
-- ==========================================
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_category TEXT NOT NULL CHECK (business_category IN ('plumber', 'dentist', 'salon', 'lawyer', 'hvac', 'electrician', 'general')),
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  owner_email TEXT,
  business_phone TEXT,
  service_area TEXT,
  business_hours JSONB DEFAULT '{}',
  services_offered JSONB DEFAULT '[]',
  pricing_info TEXT,
  booking_url TEXT,
  custom_greeting TEXT,
  custom_instructions TEXT,
  faq JSONB DEFAULT '[]',
  twilio_phone_number TEXT UNIQUE,
  twilio_phone_sid TEXT,
  vapi_assistant_id TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'pro')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled')),
  calls_used_this_month INTEGER DEFAULT 0,
  calls_limit INTEGER DEFAULT 5,
  billing_cycle_start TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  setup_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_businesses_twilio_phone ON businesses(twilio_phone_number);
CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_businesses_vapi_assistant ON businesses(vapi_assistant_id);

-- ==========================================
-- Table: calls
-- ==========================================
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  caller_phone TEXT,
  caller_name TEXT,
  call_duration_seconds INTEGER,
  twilio_call_sid TEXT UNIQUE,
  vapi_call_id TEXT UNIQUE,
  call_summary TEXT,
  caller_need TEXT,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'emergency')),
  caller_address TEXT,
  caller_email TEXT,
  appointment_requested BOOLEAN DEFAULT false,
  appointment_datetime TIMESTAMPTZ,
  transcript JSONB,
  recording_url TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  call_outcome TEXT CHECK (call_outcome IN ('appointment_booked', 'message_taken', 'info_provided', 'caller_hung_up', 'transferred')),
  ai_confidence_score NUMERIC(3,2),
  sms_sent BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  owner_reviewed BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calls_business_id ON calls(business_id);
CREATE INDEX idx_calls_created_at ON calls(created_at DESC);
CREATE INDEX idx_calls_business_created ON calls(business_id, created_at DESC);

-- ==========================================
-- Table: business_templates
-- ==========================================
CREATE TABLE business_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  default_greeting TEXT NOT NULL,
  default_instructions TEXT NOT NULL,
  default_services JSONB DEFAULT '[]',
  default_faq JSONB DEFAULT '[]',
  icon TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- Table: plans
-- ==========================================
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  calls_per_month INTEGER NOT NULL,
  stripe_price_id TEXT,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true
);

-- ==========================================
-- Row Level Security
-- ==========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Users can only access their own row
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Businesses: users can only access businesses they own
CREATE POLICY "Users can view own businesses" ON businesses
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can insert own businesses" ON businesses
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can update own businesses" ON businesses
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can delete own businesses" ON businesses
  FOR DELETE USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- Calls: users can only access calls for their businesses
CREATE POLICY "Users can view calls for own businesses" ON calls
  FOR SELECT USING (
    business_id IN (
      SELECT b.id FROM businesses b
      JOIN users u ON b.user_id = u.id
      WHERE u.clerk_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update calls for own businesses" ON calls
  FOR UPDATE USING (
    business_id IN (
      SELECT b.id FROM businesses b
      JOIN users u ON b.user_id = u.id
      WHERE u.clerk_id = auth.uid()::text
    )
  );

-- ==========================================
-- Seed: plans
-- ==========================================
INSERT INTO plans (name, display_name, price_cents, calls_per_month, features) VALUES
  ('free', 'Free', 0, 5, '["5 calls/month", "SMS summaries", "Call transcripts"]'),
  ('starter', 'Starter', 2900, 50, '["50 calls/month", "SMS + email summaries", "Call transcripts", "Custom greeting"]'),
  ('pro', 'Pro', 5900, 200, '["200 calls/month", "Everything in Starter", "Appointment booking", "Custom AI instructions", "Priority support"]');

-- ==========================================
-- Seed: business_templates
-- ==========================================
INSERT INTO business_templates (category, display_name, default_greeting, default_instructions, default_services, default_faq, icon, description) VALUES
(
  'plumber',
  'Plumbing Business',
  'Hi, thanks for calling {business_name}! {owner_name} is on a job right now, but I can help you out. What plumbing issue are you dealing with?',
  'You are a receptionist for a plumbing business. Callers often have urgent water issues. Always ask about the severity — is water actively leaking? Collect the address since plumbers need to come on-site. For emergencies like flooding or burst pipes, mark as urgent immediately.',
  '["Leak repair", "Pipe installation", "Drain cleaning", "Water heater repair", "Emergency plumbing", "Bathroom remodeling"]',
  '[{"q": "Do you offer free estimates?", "a": "Yes, we offer free estimates for most jobs. The owner will discuss details when they call you back."}, {"q": "Do you handle emergencies?", "a": "Absolutely! We handle plumbing emergencies. Let me get your details so we can help you as soon as possible."}, {"q": "What areas do you serve?", "a": "Let me have the owner confirm your area when they call you back."}]',
  'Wrench',
  'Perfect for plumbers, drain specialists, and water heater technicians'
),
(
  'dentist',
  'Dental Practice',
  'Hello, thank you for calling {business_name}! {owner_name} is with a patient right now. I''d be happy to help you — are you looking to schedule an appointment?',
  'You are a receptionist for a dental practice. Patients may be calling about appointments, pain, or dental emergencies. For pain or emergencies, express empathy and urgency. Never give medical or dental advice. Collect whether they are a new or existing patient.',
  '["Teeth cleaning", "Fillings", "Root canal", "Teeth whitening", "Emergency dental", "Dental implants"]',
  '[{"q": "Do you accept insurance?", "a": "We work with many insurance providers. Our team will verify your coverage when they call you back."}, {"q": "Are you accepting new patients?", "a": "Yes! We''d love to have you. Let me take your information so we can get you scheduled."}, {"q": "What should I do for a dental emergency?", "a": "I''m so sorry you''re dealing with that. Let me get your information right away so the doctor can call you back as soon as possible."}]',
  'Stethoscope',
  'Perfect for dental offices, orthodontists, and oral surgeons'
),
(
  'salon',
  'Hair Salon / Barbershop',
  'Hey there, thanks for calling {business_name}! {owner_name} is with a client right now. I can help you book an appointment or answer any questions!',
  'You are a receptionist for a hair salon or barbershop. Callers usually want to book appointments. Ask what service they want and if they have a preferred stylist. Be friendly and upbeat. Ask about timing preferences.',
  '["Haircut", "Color", "Highlights", "Blowout", "Beard trim", "Special occasion styling"]',
  '[{"q": "How much is a haircut?", "a": "Pricing varies by stylist and service. Let me have someone call you back with exact pricing for what you need."}, {"q": "Do I need an appointment?", "a": "We recommend appointments to guarantee your spot, but we do take walk-ins when available."}, {"q": "Do you do wedding hair?", "a": "Yes! We love doing special occasion styling. Let me get your details so we can discuss your vision."}]',
  'Scissors',
  'Perfect for hair salons, barbershops, and beauty studios'
),
(
  'lawyer',
  'Law Firm',
  'Thank you for calling {business_name}. {owner_name} is currently unavailable. I can take a message or help schedule a consultation. How can I assist you?',
  'You are a receptionist for a law firm. CRITICAL: Never give any legal advice whatsoever. Do not discuss case specifics or outcomes. Simply collect the caller''s name, contact info, and a brief description of what they need help with. Be professional and empathetic. Mention that the attorney offers consultations.',
  '["Consultation", "Personal injury", "Family law", "Estate planning", "Business law", "Criminal defense"]',
  '[{"q": "How much does a consultation cost?", "a": "Consultation details and fees vary by case type. The attorney will discuss that when they reach out to you."}, {"q": "Can you give me legal advice?", "a": "I''m not able to provide legal advice, but I can have the attorney call you back to discuss your situation."}, {"q": "How quickly can I meet with the attorney?", "a": "Let me take your information and the attorney''s office will get back to you with available times."}]',
  'Scale',
  'Perfect for law firms, solo attorneys, and legal practices'
),
(
  'hvac',
  'HVAC / Heating & Cooling',
  'Hi, thanks for calling {business_name}! {owner_name} is out on a service call. I can help you — are you having a heating or cooling issue?',
  'You are a receptionist for an HVAC company. Callers often have urgent temperature issues, especially in extreme weather. Ask if their system is completely down (more urgent). Collect the address since HVAC techs come on-site. For no heat in winter or no AC in extreme summer heat, mark as urgent.',
  '["AC repair", "Heating repair", "HVAC installation", "Duct cleaning", "Thermostat installation", "Preventive maintenance"]',
  '[{"q": "Do you offer emergency service?", "a": "Yes, we handle HVAC emergencies. Let me get your information so we can help you as quickly as possible."}, {"q": "How much does a service call cost?", "a": "Service call pricing depends on the issue. The owner will give you a clear estimate when they call back."}, {"q": "Do you service all brands?", "a": "We work on most major brands. Let me get your details and the type of system you have."}]',
  'Thermometer',
  'Perfect for HVAC companies, heating specialists, and AC repair services'
),
(
  'electrician',
  'Electrical Services',
  'Hi, thanks for calling {business_name}! {owner_name} is on a job right now. I can help you — what electrical issue are you experiencing?',
  'You are a receptionist for an electrical services company. Safety is critical. If the caller mentions sparking, burning smell, exposed wires, or electrical fire, treat as an emergency. Always tell emergency callers to call 911 first if there is immediate danger. Collect address for on-site work.',
  '["Electrical repair", "Panel upgrade", "Outlet installation", "Lighting installation", "Wiring", "Emergency electrical"]',
  '[{"q": "Do you handle emergencies?", "a": "Yes, we handle electrical emergencies. If you''re in immediate danger, please call 911 first, then we''ll get someone out to you."}, {"q": "Are you licensed?", "a": "Yes, we are fully licensed and insured. The owner can provide details when they call you back."}, {"q": "Do you do residential and commercial?", "a": "We serve both residential and commercial customers. Let me get your details."}]',
  'Zap',
  'Perfect for electricians and electrical contractors'
),
(
  'general',
  'General Business',
  'Hi, thanks for calling {business_name}! {owner_name} isn''t available right now, but I can help. What can I do for you?',
  'You are a receptionist for a local business. Be friendly and helpful. Collect the caller''s name, phone number, and what they need. Take a clear message so the owner can follow up.',
  '["General inquiry", "Appointment booking", "Product information", "Service request", "Complaint resolution", "Billing question"]',
  '[{"q": "What are your hours?", "a": "Let me have the owner confirm our current hours when they get back to you."}, {"q": "Where are you located?", "a": "The owner will share our location details when they call you back."}, {"q": "Do you offer free estimates?", "a": "Let me take your information and the owner will discuss pricing with you."}]',
  'Building2',
  'Works for any type of local business'
);

-- ==========================================
-- Updated_at trigger function
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==============================================
-- Migration: Replace clerk_id with auth_id
-- Run this AFTER the original migration.sql
-- ==============================================

-- Step 1: Add auth_id column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;

-- Step 2: Drop old clerk-related constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_clerk_id_key;

-- Step 3: Drop clerk_id column (if you want a clean break)
-- ALTER TABLE users DROP COLUMN IF EXISTS clerk_id;
-- NOTE: If you have existing data mapped by clerk_id, keep it for now.
-- For a fresh install, you can uncomment the line above.

-- Step 4: Make auth_id NOT NULL for new rows
-- (Only do this on fresh installs or after backfilling)
-- ALTER TABLE users ALTER COLUMN auth_id SET NOT NULL;

-- Step 5: Update RLS policies for Supabase Auth
-- Drop old Clerk-based policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can insert own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can update own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can delete own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can view calls for own businesses" ON calls;
DROP POLICY IF EXISTS "Users can update calls for own businesses" ON calls;

-- New policies using Supabase auth.uid()
-- Users table
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth_id = auth.uid());

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth_id = auth.uid());

CREATE POLICY "Users can insert own row" ON users
  FOR INSERT WITH CHECK (auth_id = auth.uid());

-- Businesses table
CREATE POLICY "Users can view own businesses" ON businesses
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can insert own businesses" ON businesses
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can update own businesses" ON businesses
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can delete own businesses" ON businesses
  FOR DELETE USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Calls table
CREATE POLICY "Users can view calls for own businesses" ON calls
  FOR SELECT USING (
    business_id IN (
      SELECT b.id FROM businesses b
      JOIN users u ON b.user_id = u.id
      WHERE u.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can update calls for own businesses" ON calls
  FOR UPDATE USING (
    business_id IN (
      SELECT b.id FROM businesses b
      JOIN users u ON b.user_id = u.id
      WHERE u.auth_id = auth.uid()
    )
  );

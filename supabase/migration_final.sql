-- ==============================================
-- Final Migration: Clean auth_id setup + DB trigger
-- Run this AFTER migration.sql and migration_auth_id.sql
-- ==============================================

-- Step 1: Make clerk_id nullable (it was NOT NULL in original migration)
-- This allows inserts without clerk_id for new Supabase Auth users
ALTER TABLE users ALTER COLUMN clerk_id DROP NOT NULL;

-- Step 2: Ensure auth_id exists and is NOT NULL for new rows
-- If auth_id column doesn't exist yet, the migration_auth_id.sql should have added it
ALTER TABLE users ALTER COLUMN auth_id SET NOT NULL;

-- Step 3: Create a DB trigger to auto-create user row when auth.users gets a new entry
-- This is more reliable than client-side insert or webhooks
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  )
  ON CONFLICT (auth_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Step 4: Ensure the service role can insert calls (webhooks use service role)
-- Service role bypasses RLS, but let's be explicit with a policy for clarity
-- Actually, service role key always bypasses RLS in Supabase, so no policy needed.

-- Step 5: Allow service role to insert into calls (for webhooks)
-- The service role bypasses RLS by default, but we need an INSERT policy
-- for the anon/authenticated role if we ever use it
DROP POLICY IF EXISTS "Service can insert calls" ON calls;
CREATE POLICY "Service can insert calls" ON calls
  FOR INSERT WITH CHECK (true);

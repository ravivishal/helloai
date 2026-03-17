-- ==============================================
-- Migration: Add role-based access control
-- Run this AFTER all previous migrations
-- ==============================================

-- Step 1: Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'
  CHECK (role IN ('user', 'admin', 'superadmin'));

-- Step 2: Create index on role for fast admin lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Step 3: Admin RLS policies
-- Admins can view ALL users
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('admin', 'superadmin'))
  );

-- Admins can update ALL users
DROP POLICY IF EXISTS "Admins can update all users" ON users;
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('admin', 'superadmin'))
  );

-- Admins can view ALL businesses
DROP POLICY IF EXISTS "Admins can view all businesses" ON businesses;
CREATE POLICY "Admins can view all businesses" ON businesses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('admin', 'superadmin'))
  );

-- Admins can update ALL businesses
DROP POLICY IF EXISTS "Admins can update all businesses" ON businesses;
CREATE POLICY "Admins can update all businesses" ON businesses
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('admin', 'superadmin'))
  );

-- Admins can insert businesses for any user
DROP POLICY IF EXISTS "Admins can insert businesses" ON businesses;
CREATE POLICY "Admins can insert businesses" ON businesses
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('admin', 'superadmin'))
  );

-- Admins can delete businesses
DROP POLICY IF EXISTS "Admins can delete businesses" ON businesses;
CREATE POLICY "Admins can delete businesses" ON businesses
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('admin', 'superadmin'))
  );

-- Admins can view ALL calls
DROP POLICY IF EXISTS "Admins can view all calls" ON calls;
CREATE POLICY "Admins can view all calls" ON calls
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('admin', 'superadmin'))
  );

-- Admins can update ALL calls
DROP POLICY IF EXISTS "Admins can update all calls" ON calls;
CREATE POLICY "Admins can update all calls" ON calls
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('admin', 'superadmin'))
  );

-- Step 4: Promote an existing user to superadmin (run manually)
-- UPDATE users SET role = 'superadmin' WHERE email = 'your-email@example.com';

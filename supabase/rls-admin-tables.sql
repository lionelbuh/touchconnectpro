-- RLS Policies for admin_users and admin_sessions tables
-- These tables should only be accessible via the service role key (which bypasses RLS)
-- No public access is allowed

-- ============================================
-- admin_users table
-- ============================================

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "No public access to admin_users" ON admin_users;

-- Policy: Deny all access via anon/authenticated roles
-- Service role key bypasses RLS, so backend can still access
CREATE POLICY "No public access to admin_users"
ON admin_users
FOR ALL
USING (false)
WITH CHECK (false);

-- ============================================
-- admin_sessions table
-- ============================================

-- Enable RLS
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "No public access to admin_sessions" ON admin_sessions;

-- Policy: Deny all access via anon/authenticated roles
-- Service role key bypasses RLS, so backend can still access
CREATE POLICY "No public access to admin_sessions"
ON admin_sessions
FOR ALL
USING (false)
WITH CHECK (false);

-- ============================================
-- Verification queries (optional - run to confirm)
-- ============================================

-- Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('admin_users', 'admin_sessions');

-- Check policies exist:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename IN ('admin_users', 'admin_sessions');

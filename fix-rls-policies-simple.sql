-- Simple fix for RLS policies - Option 1: Disable RLS temporarily for registration
-- This is the quickest fix for the registration issue

-- Option 1: Disable RLS on users table (simplest solution)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, create a policy that allows all operations
-- (Uncomment the lines below if you prefer this approach)

-- DROP POLICY IF EXISTS "Allow all operations" ON users;
-- CREATE POLICY "Allow all operations" ON users
--     FOR ALL
--     USING (true)
--     WITH CHECK (true);

-- Also disable RLS on user_sessions table
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'user_sessions');

-- If you want to re-enable RLS later with proper policies, use:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY; 
-- Fix RLS policies for user registration
-- This script updates the RLS policies to allow user registration

-- First, let's check the current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;

-- Create new policies that allow registration
-- Policy 1: Allow users to view their own data
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT
    USING (auth.uid()::text = id);

-- Policy 2: Allow users to update their own data
CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE
    USING (auth.uid()::text = id)
    WITH CHECK (auth.uid()::text = id);

-- Policy 3: Allow user registration (insert) - this is the key fix
CREATE POLICY "Allow user registration" ON users
    FOR INSERT
    WITH CHECK (true); -- Allow all inserts for registration

-- Policy 4: Allow users to delete their own data (optional)
CREATE POLICY "Users can delete their own data" ON users
    FOR DELETE
    USING (auth.uid()::text = id);

-- Also fix the user_sessions table policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON user_sessions;

-- Create policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own sessions" ON user_sessions
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own sessions" ON user_sessions
    FOR UPDATE
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own sessions" ON user_sessions
    FOR DELETE
    USING (auth.uid()::text = user_id);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('users', 'user_sessions')
ORDER BY tablename, policyname; 
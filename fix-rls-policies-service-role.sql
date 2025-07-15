-- Fix RLS policies using service role approach
-- This is the most secure approach for handling registration

-- First, let's check the current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;

-- Create policies for users table
-- Policy 1: Allow users to view their own data
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT
    USING (auth.uid()::text = id);

-- Policy 2: Allow users to update their own data
CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE
    USING (auth.uid()::text = id)
    WITH CHECK (auth.uid()::text = id);

-- Policy 3: Allow service role to manage users (for registration)
CREATE POLICY "Service role can manage users" ON users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Also fix the user_sessions table policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Service role can manage sessions" ON user_sessions;

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

-- Policy for service role to manage sessions
CREATE POLICY "Service role can manage sessions" ON user_sessions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('users', 'user_sessions')
ORDER BY tablename, policyname; 
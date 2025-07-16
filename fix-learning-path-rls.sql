-- Fix RLS policies for learning_paths table
-- This script ensures users can create and manage their own learning paths

-- First, let's check the current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'learning_paths';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own learning paths" ON learning_paths;
DROP POLICY IF EXISTS "Users can create own learning paths" ON learning_paths;
DROP POLICY IF EXISTS "Users can update own learning paths" ON learning_paths;
DROP POLICY IF EXISTS "Users can delete own learning paths" ON learning_paths;

-- Create new policies that work with the current auth system
CREATE POLICY "Users can view own learning paths" ON learning_paths
    FOR SELECT USING (
        user_id = auth.uid() OR is_public = true
    );

CREATE POLICY "Users can create own learning paths" ON learning_paths
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

CREATE POLICY "Users can update own learning paths" ON learning_paths
    FOR UPDATE USING (
        user_id = auth.uid()
    );

CREATE POLICY "Users can delete own learning paths" ON learning_paths
    FOR DELETE USING (
        user_id = auth.uid()
    );

-- Alternative: If the above doesn't work, we can temporarily disable RLS
-- ALTER TABLE learning_paths DISABLE ROW LEVEL SECURITY;

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'learning_paths'; 
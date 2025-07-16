-- Fix Session Token Length and Learning Paths RLS Issues
-- Copy and paste this entire script into your Supabase SQL Editor

-- 1. Fix Session Token Length Issue
ALTER TABLE public.user_sessions 
ALTER COLUMN session_token TYPE TEXT;

-- 2. Fix Learning Paths RLS Policies
-- Drop ALL existing policies for learning_paths
DROP POLICY IF EXISTS "Users can manage their own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.learning_paths;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.learning_paths;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.learning_paths;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.learning_paths;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.learning_paths;

-- Create new comprehensive policies
CREATE POLICY "Users can manage their own learning paths" ON public.learning_paths
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Alternative: If you want to allow all authenticated users to read all learning paths
CREATE POLICY "Enable read access for all authenticated users" ON public.learning_paths
    FOR SELECT USING (auth.role() = 'authenticated');

-- 3. Verify the changes
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'user_sessions' AND column_name = 'session_token';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'learning_paths'; 
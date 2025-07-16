-- Fix Learning Paths RLS Policy Issue
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.learning_paths;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.learning_paths;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.learning_paths;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.learning_paths;

-- Create new comprehensive policies
CREATE POLICY "Users can manage their own learning paths" ON public.learning_paths
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Alternative: If you want to allow all authenticated users to read all learning paths
CREATE POLICY "Enable read access for all authenticated users" ON public.learning_paths
    FOR SELECT USING (auth.role() = 'authenticated');

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'learning_paths'; 
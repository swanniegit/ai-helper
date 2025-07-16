-- Final Fix for Learning Paths RLS Policy Issue
-- Run this in your Supabase SQL Editor

-- 1. First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'learning_paths';

-- 2. Drop ALL existing policies for learning_paths
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.learning_paths;
DROP POLICY IF EXISTS "Users can create own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Users can delete own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Users can manage their own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Users can update own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Users can view own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.learning_paths;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.learning_paths;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.learning_paths;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.learning_paths;

-- 3. Create a simple, comprehensive policy that allows all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON public.learning_paths
    FOR ALL USING (auth.role() = 'authenticated');

-- 4. Alternative: If you want more restrictive policies, use these instead:
-- CREATE POLICY "Users can insert their own learning paths" ON public.learning_paths
--     FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
-- 
-- CREATE POLICY "Users can view all learning paths" ON public.learning_paths
--     FOR SELECT USING (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Users can update their own learning paths" ON public.learning_paths
--     FOR UPDATE USING (auth.uid()::text = user_id::text);
-- 
-- CREATE POLICY "Users can delete their own learning paths" ON public.learning_paths
--     FOR DELETE USING (auth.uid()::text = user_id::text);

-- 5. Verify the new policy
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'learning_paths'; 
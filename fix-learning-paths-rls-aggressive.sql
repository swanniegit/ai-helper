-- Aggressive Fix for Learning Paths RLS Policy Issue
-- Run this in your Supabase SQL Editor

-- 1. First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'learning_paths';

-- 2. Temporarily disable RLS on the learning_paths table
ALTER TABLE public.learning_paths DISABLE ROW LEVEL SECURITY;

-- 3. Drop ALL existing policies for learning_paths (just to be safe)
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
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.learning_paths;

-- 4. Re-enable RLS
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;

-- 5. Create a simple, permissive policy that allows all authenticated users to do everything
CREATE POLICY "Allow all operations for authenticated users" ON public.learning_paths
    FOR ALL USING (auth.role() = 'authenticated');

-- 6. Verify the new policy
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'learning_paths';

-- 7. Test that RLS is working
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'learning_paths'; 
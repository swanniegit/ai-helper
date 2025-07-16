-- Final Fix for Learning Paths RLS Policy Issue
-- Run this in your Supabase SQL Editor

-- 1. Completely disable RLS temporarily
ALTER TABLE public.learning_paths DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies
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

-- 3. Re-enable RLS
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;

-- 4. Create a very permissive policy that allows all authenticated users to do everything
CREATE POLICY "Allow all authenticated users full access" ON public.learning_paths
    FOR ALL USING (auth.role() = 'authenticated');

-- 5. Verify the fix
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'learning_paths';

-- 6. Test RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'learning_paths'; 
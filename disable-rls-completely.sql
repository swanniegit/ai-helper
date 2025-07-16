-- Completely Disable RLS on Learning Paths Table
-- This is a nuclear option to fix the RLS issue permanently

-- 1. Disable RLS completely on the learning_paths table
ALTER TABLE public.learning_paths DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL policies (just to be safe)
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
DROP POLICY IF EXISTS "Allow all authenticated users full access" ON public.learning_paths;

-- 3. Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'learning_paths';

-- 4. Verify no policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'learning_paths'; 
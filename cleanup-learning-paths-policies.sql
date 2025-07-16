-- Clean up Learning Paths RLS Policies
-- This will remove all conflicting policies and create clean ones

-- 1. Drop ALL existing policies for learning_paths
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.learning_paths;
DROP POLICY IF EXISTS "Users can create own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Users can delete own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Users can manage their own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Users can update own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Users can view own learning paths" ON public.learning_paths;

-- 2. Create a single, clean policy for all operations
CREATE POLICY "Users can manage their own learning paths" ON public.learning_paths
    FOR ALL USING (auth.uid()::text = user_id::text);

-- 3. Create a separate policy for public read access (optional)
CREATE POLICY "Enable read access for all authenticated users" ON public.learning_paths
    FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Verify the changes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'learning_paths'
ORDER BY policyname; 
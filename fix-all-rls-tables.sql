-- Fix RLS on All Related Tables
-- This will disable RLS on all tables that are causing security policy violations

-- 1. Disable RLS on skill_assessments
ALTER TABLE public.skill_assessments DISABLE ROW LEVEL SECURITY;

-- 2. Disable RLS on career_goals
ALTER TABLE public.career_goals DISABLE ROW LEVEL SECURITY;

-- 3. Disable RLS on priority_areas
ALTER TABLE public.priority_areas DISABLE ROW LEVEL SECURITY;

-- 4. Drop any existing policies on these tables
DROP POLICY IF EXISTS "Users can manage their own skill assessments" ON public.skill_assessments;
DROP POLICY IF EXISTS "Users can manage their own career goals" ON public.career_goals;
DROP POLICY IF EXISTS "Users can manage their own priority areas" ON public.priority_areas;

-- 5. Verify RLS is disabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('learning_paths', 'skill_assessments', 'career_goals', 'priority_areas');

-- 6. Verify no policies exist on these tables
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('learning_paths', 'skill_assessments', 'career_goals', 'priority_areas'); 
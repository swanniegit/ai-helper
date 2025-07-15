-- Test Database Setup
-- Run this after the main setup script to verify everything is working

-- Test 1: Check if tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'users',
    'user_sessions', 
    'learning_paths',
    'skill_assessments',
    'career_goals',
    'priority_areas',
    'learning_plans',
    'plan_quarters',
    'progress_tracking'
)
ORDER BY table_name;

-- Test 2: Check if indexes exist
SELECT 
    indexname,
    CASE 
        WHEN indexname IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname IN (
    'idx_users_email',
    'idx_user_sessions_user_id',
    'idx_user_sessions_token',
    'idx_learning_paths_user_id',
    'idx_learning_paths_career_path'
)
ORDER BY indexname;

-- Test 3: Check if triggers exist
SELECT 
    trigger_name,
    CASE 
        WHEN trigger_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name IN (
    'update_users_updated_at',
    'update_user_sessions_updated_at',
    'update_learning_paths_updated_at',
    'update_career_goals_updated_at',
    'update_progress_tracking_updated_at'
)
ORDER BY trigger_name;

-- Test 4: Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'users',
    'user_sessions',
    'learning_paths',
    'skill_assessments',
    'career_goals',
    'priority_areas',
    'learning_plans',
    'plan_quarters',
    'progress_tracking'
)
ORDER BY tablename;

-- Test 5: Check if policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN policyname IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as policy_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
ORDER BY policyname; 
-- Fix Session Token Length Issue
-- Run this in your Supabase SQL Editor

-- 1. Fix the session token column to allow longer tokens
ALTER TABLE public.user_sessions 
ALTER COLUMN session_token TYPE TEXT;

-- 2. Verify the change
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'user_sessions' AND column_name = 'session_token'; 
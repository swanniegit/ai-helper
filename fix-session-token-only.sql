-- Fix Session Token Length Issue Only
-- Run this in your Supabase SQL Editor

-- Change session_token column from VARCHAR(255) to TEXT
ALTER TABLE public.user_sessions 
ALTER COLUMN session_token TYPE TEXT;

-- Verify the change
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'user_sessions' AND column_name = 'session_token'; 
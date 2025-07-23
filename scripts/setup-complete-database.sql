-- Complete Database Setup Script for AI Helper Learning Path System
-- Run this in your Supabase SQL Editor to set up all necessary tables

-- This script will create all the tables needed for the application to function properly
-- including authentication, learning paths, quiz system, gamification, and social competition

-- Execute the complete schema
\i database/complete-schema.sql

-- Insert some initial data for testing
INSERT INTO public.badge_definitions (name, description, icon_name, category, xp_reward, unlock_condition, sort_order) VALUES
('First Steps', 'Complete your first quiz', 'graduation-cap', 'mastery', 50, '{"quiz_count": 1}', 1),
('Perfect Score', 'Get a perfect score on any quiz', 'star', 'mastery', 100, '{"perfect_scores": 1}', 2),
('Streak Master', 'Maintain a 7-day quiz streak', 'flame', 'streak', 200, '{"streak_days": 7}', 3),
('Social Butterfly', 'Join your first guild', 'users', 'social', 75, '{"guild_joined": 1}', 4),
('Quick Learner', 'Complete 5 quizzes in a day', 'zap', 'special', 150, '{"daily_quizzes": 5}', 5)
ON CONFLICT (name) DO NOTHING;

-- Insert some challenge templates
INSERT INTO public.challenge_templates (challenge_type, title, description, xp_reward, target_value, difficulty_level, skill_category, is_active) VALUES
('quick_learner', 'Daily Quiz Master', 'Complete 3 quizzes today', 50, 3, 'easy', 'General', true),
('perfect_score', 'Perfect Performance', 'Get a perfect score on any quiz', 100, 1, 'medium', 'General', true),
('streak_maintainer', 'Consistency Champion', 'Maintain your quiz streak for 3 days', 75, 3, 'easy', 'General', true),
('skill_explorer', 'PHP Explorer', 'Complete a PHP-focused quiz', 60, 1, 'easy', 'PHP', true),
('mentor_session', 'Mentor Chat', 'Have a conversation with the AI mentor', 40, 1, 'easy', 'General', true)
ON CONFLICT DO NOTHING;

-- Insert some quiz templates
INSERT INTO public.quiz_templates (name, description, quiz_type, skill_category, difficulty_level, question_count, time_limit_minutes, passing_score, is_active) VALUES
('PHP Basics Assessment', 'Test your knowledge of PHP fundamentals', 'skills_assessment', 'PHP', 'beginner', 10, 15, 70, true),
('Oracle Database Fundamentals', 'Basic Oracle database concepts and SQL', 'skills_assessment', 'Oracle', 'beginner', 10, 20, 70, true),
('General Programming Concepts', 'Core programming concepts and best practices', 'practice', 'General', 'intermediate', 15, 25, 70, true),
('Web Development Essentials', 'HTML, CSS, and JavaScript fundamentals', 'practice', 'Web Development', 'beginner', 12, 20, 70, true)
ON CONFLICT DO NOTHING;

-- Insert some seasonal events
INSERT INTO public.seasonal_events (event_key, title, description, event_type, starts_at, ends_at, xp_multiplier, focus_skill_category, special_rewards, community_target, theme_color, icon_name, is_active) VALUES
('spring_learning_2024', 'Spring Learning Challenge', 'Boost your skills this spring with special rewards and community goals', 'community_goal', '2024-03-20 00:00:00+00', '2024-06-20 23:59:59+00', 1.5, 'General', '[{"type": "badge", "value": "Spring Learner", "requirement": "Complete 10 quizzes"}]', 1000, '#4ade80', 'leaf', true),
('php_mastery_2024', 'PHP Mastery Quest', 'Master PHP fundamentals with focused challenges and exclusive rewards', 'individual_goal', '2024-04-01 00:00:00+00', '2024-04-30 23:59:59+00', 2.0, 'PHP', '[{"type": "title", "value": "PHP Enthusiast", "requirement": "Complete 5 PHP quizzes"}]', NULL, '#f97316', 'code', true),
('summer_coding_2024', 'Summer Coding Sprint', 'Intensive coding challenge with community milestones and special badges', 'community_goal', '2024-06-01 00:00:00+00', '2024-08-31 23:59:59+00', 1.3, 'General', '[{"type": "badge", "value": "Summer Coder", "requirement": "Participate in community goal"}]', 500, '#06b6d4', 'sun', true)
ON CONFLICT (event_key) DO NOTHING;

-- Success message
SELECT 'Complete database setup with initial data completed successfully!' as status; 
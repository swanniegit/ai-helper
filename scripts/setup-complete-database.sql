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

-- Insert some sample guilds (only if users exist)
INSERT INTO public.guilds (name, display_name, description, skill_focus, guild_type, max_members, current_members, is_public, guild_level, total_guild_xp, created_by) 
SELECT 
  'php-masters', 'PHP Masters Guild', 'Advanced PHP development and best practices', 'php', 'skill_guild', 30, 5, true, 3, 1500, u.id
FROM public.users u 
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.guilds (name, display_name, description, skill_focus, guild_type, max_members, current_members, is_public, guild_level, total_guild_xp, created_by) 
SELECT 
  'oracle-experts', 'Oracle Database Experts', 'Oracle database administration and optimization', 'oracle', 'skill_guild', 25, 3, true, 2, 800, u.id
FROM public.users u 
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.guilds (name, display_name, description, skill_focus, guild_type, max_members, current_members, is_public, guild_level, total_guild_xp, created_by) 
SELECT 
  'fullstack-dev', 'Full Stack Developers', 'Complete web development from frontend to backend', 'full_stack', 'study_squad', 40, 8, true, 4, 2200, u.id
FROM public.users u 
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.guilds (name, display_name, description, skill_focus, guild_type, max_members, current_members, is_public, guild_level, total_guild_xp, created_by) 
SELECT 
  'general-learners', 'General Programming', 'General programming concepts and problem solving', 'general', 'mentor_circle', 35, 6, true, 2, 1200, u.id
FROM public.users u 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample quest templates
INSERT INTO public.quest_templates (quest_key, title, description, narrative_text, quest_type, required_level, xp_reward, quest_giver_name, quest_giver_avatar, estimated_duration_hours, difficulty_rating) VALUES
('first_quiz', 'The First Step', 'Complete your very first quiz to begin your learning journey', 'Welcome, young learner! Every great journey begins with a single step. Prove your readiness by completing your first quiz.', 'main_story', 1, 100, 'Mentor Sage', '🧙‍♂️', 1, 1),
('php_basics', 'PHP Fundamentals', 'Master the basics of PHP programming', 'The path to PHP mastery lies before you. Learn the fundamentals and unlock the power of server-side scripting.', 'side_quest', 2, 200, 'Code Master', '👨‍💻', 3, 2),
('daily_practice', 'Daily Practice Routine', 'Complete a quiz every day for a week', 'Consistency is the key to mastery. Establish a daily practice routine to accelerate your learning.', 'daily', 1, 50, 'Discipline Keeper', '⏰', 1, 1),
('social_network', 'Join the Community', 'Join a guild and connect with other learners', 'Learning is better together! Join a guild and discover the power of collaborative learning.', 'social', 1, 75, 'Community Guide', '🤝', 1, 1),
('perfect_score', 'Perfection Seeker', 'Achieve a perfect score on any quiz', 'Excellence is not a skill, it is an attitude. Strive for perfection in your learning journey.', 'special', 3, 300, 'Perfection Master', '⭐', 2, 3)
ON CONFLICT (quest_key) DO NOTHING;

-- Insert quest objectives
INSERT INTO public.quest_objectives (quest_template_id, description, target_type, target_value, objective_order) 
SELECT 
  qt.id, 'Complete a quiz', 'quiz_completion', 1, 1
FROM public.quest_templates qt WHERE qt.quest_key = 'first_quiz'
ON CONFLICT DO NOTHING;

INSERT INTO public.quest_objectives (quest_template_id, description, target_type, target_value, objective_order) 
SELECT 
  qt.id, 'Complete PHP-focused quizzes', 'php_quiz_completion', 3, 1
FROM public.quest_templates qt WHERE qt.quest_key = 'php_basics'
ON CONFLICT DO NOTHING;

INSERT INTO public.quest_objectives (quest_template_id, description, target_type, target_value, objective_order) 
SELECT 
  qt.id, 'Complete daily quizzes', 'daily_quiz_completion', 7, 1
FROM public.quest_templates qt WHERE qt.quest_key = 'daily_practice'
ON CONFLICT DO NOTHING;

INSERT INTO public.quest_objectives (quest_template_id, description, target_type, target_value, objective_order) 
SELECT 
  qt.id, 'Join a guild', 'guild_join', 1, 1
FROM public.quest_templates qt WHERE qt.quest_key = 'social_network'
ON CONFLICT DO NOTHING;

INSERT INTO public.quest_objectives (quest_template_id, description, target_type, target_value, objective_order) 
SELECT 
  qt.id, 'Get a perfect score', 'perfect_score', 1, 1
FROM public.quest_templates qt WHERE qt.quest_key = 'perfect_score'
ON CONFLICT DO NOTHING;

-- Insert quest steps
INSERT INTO public.quest_steps (quest_template_id, step_key, step_name, step_description, step_narrative, step_order, step_xp_reward) 
SELECT 
  qt.id, 'step_1', 'Choose a Quiz', 'Select any quiz from the available templates', 'First, you must choose your challenge wisely. Pick a quiz that matches your current skill level.', 1, 25
FROM public.quest_templates qt WHERE qt.quest_key = 'first_quiz'
ON CONFLICT DO NOTHING;

INSERT INTO public.quest_steps (quest_template_id, step_key, step_name, step_description, step_narrative, step_order, step_xp_reward) 
SELECT 
  qt.id, 'step_2', 'Complete the Quiz', 'Answer all questions to the best of your ability', 'Now face your challenge with courage and determination. Every question is an opportunity to learn.', 2, 50
FROM public.quest_templates qt WHERE qt.quest_key = 'first_quiz'
ON CONFLICT DO NOTHING;

INSERT INTO public.quest_steps (quest_template_id, step_key, step_name, step_description, step_narrative, step_order, step_xp_reward) 
SELECT 
  qt.id, 'step_3', 'Review Results', 'Check your score and understand your performance', 'Reflect on your performance. Understanding your strengths and weaknesses is the path to improvement.', 3, 25
FROM public.quest_templates qt WHERE qt.quest_key = 'first_quiz'
ON CONFLICT DO NOTHING;

-- Insert quest NPCs
INSERT INTO public.quest_npcs (npc_key, npc_name, npc_title, npc_description, npc_personality, npc_avatar_emoji, npc_avatar_color) VALUES
('mentor_sage', 'Mentor Sage', 'Wise Learning Guide', 'A wise mentor who guides new learners on their journey', 'Wise, patient, encouraging', '🧙‍♂️', '#8B5CF6'),
('code_master', 'Code Master', 'Programming Expert', 'An expert programmer who shares deep knowledge', 'Knowledgeable, precise, helpful', '👨‍💻', '#3B82F6'),
('discipline_keeper', 'Discipline Keeper', 'Habit Formation Specialist', 'Helps learners develop consistent study habits', 'Structured, motivating, consistent', '⏰', '#10B981'),
('community_guide', 'Community Guide', 'Social Learning Coordinator', 'Facilitates connections between learners', 'Friendly, inclusive, supportive', '🤝', '#F59E0B'),
('perfection_master', 'Perfection Master', 'Excellence Coach', 'Encourages learners to strive for excellence', 'Demanding, inspiring, focused', '⭐', '#EF4444')
ON CONFLICT (npc_key) DO NOTHING;

-- Insert sample skill tree nodes
INSERT INTO public.skill_tree_nodes (node_key, node_name, node_description, skill_category, difficulty_level, xp_requirement, node_order) VALUES
('php_basics', 'PHP Basics', 'Fundamental PHP concepts and syntax', 'PHP', 'beginner', 0, 1),
('php_oop', 'Object-Oriented PHP', 'Classes, objects, and inheritance in PHP', 'PHP', 'intermediate', 500, 2),
('php_advanced', 'Advanced PHP', 'Advanced PHP features and best practices', 'PHP', 'advanced', 1000, 3),
('oracle_basics', 'Oracle Database Basics', 'Basic Oracle database concepts', 'Oracle', 'beginner', 0, 1),
('oracle_sql', 'Oracle SQL', 'SQL queries and database operations', 'Oracle', 'intermediate', 500, 2),
('oracle_advanced', 'Advanced Oracle', 'Advanced Oracle database administration', 'Oracle', 'advanced', 1000, 3),
('web_basics', 'Web Development Basics', 'HTML, CSS, and JavaScript fundamentals', 'Web Development', 'beginner', 0, 1),
('web_advanced', 'Advanced Web Development', 'Modern web development frameworks and tools', 'Web Development', 'intermediate', 500, 2)
ON CONFLICT (node_key) DO NOTHING;

-- Insert sample daily challenges
INSERT INTO public.daily_challenges (user_id, challenge_type, title, description, target_value, xp_reward, assigned_date, expires_at) 
SELECT 
  u.id, 'quiz_completion', 'Daily Quiz Challenge', 'Complete one quiz today', 1, 50, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day'
FROM public.users u 
LIMIT 5
ON CONFLICT DO NOTHING;

-- Insert sample leaderboard entries
INSERT INTO public.leaderboard_entries (user_id, skill_category, time_period, period_start, period_end, user_score, xp_earned, quizzes_completed, user_rank) 
SELECT 
  u.id, 'General', 'weekly', DATE_TRUNC('week', CURRENT_DATE), DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week', 500, 500, 5, 1
FROM public.users u 
LIMIT 3
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Complete database setup with initial data completed successfully!' as status; 
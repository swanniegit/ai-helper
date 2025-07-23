-- DevPath Chronicles Gamification Schema
-- Phase 1: Foundation RPG System
-- Created: 2025-01-23

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User XP and leveling system
CREATE TABLE IF NOT EXISTS public.user_xp (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
    current_level TEXT DEFAULT 'Code Apprentice' CHECK (current_level IN (
        'Code Apprentice', 'Bug Hunter', 'Logic Architect', 'Code Wizard', 'Dev Sage'
    )),
    level_progress DECIMAL(5,2) DEFAULT 0.00 CHECK (level_progress >= 0 AND level_progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badge definitions (system-wide achievements)
CREATE TABLE IF NOT EXISTS public.badge_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL, -- lucide icon name
    category TEXT NOT NULL CHECK (category IN ('mastery', 'special', 'social', 'streak')),
    xp_reward INTEGER DEFAULT 0 CHECK (xp_reward >= 0),
    unlock_condition JSONB NOT NULL, -- flexible conditions like {"quiz_count": 1, "perfect_scores": 5}
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements (earned badges)
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notification_sent BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}', -- additional data like score achieved, streak length, etc.
    UNIQUE(user_id, badge_id)
);

-- XP transaction log for audit trail
CREATE TABLE IF NOT EXISTS public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- quiz_completed, perfect_score, mentor_chat, etc.
    xp_amount INTEGER NOT NULL CHECK (xp_amount > 0),
    source_id UUID, -- reference to quiz_result, chat_session, etc.
    source_type TEXT, -- quiz, mentor_chat, learning_milestone, etc.
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User streak tracking
CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_streak INTEGER DEFAULT 0 CHECK (quiz_streak >= 0),
    mentor_chat_streak INTEGER DEFAULT 0 CHECK (mentor_chat_streak >= 0),
    daily_activity_streak INTEGER DEFAULT 0 CHECK (daily_activity_streak >= 0),
    longest_quiz_streak INTEGER DEFAULT 0 CHECK (longest_quiz_streak >= 0),
    longest_mentor_streak INTEGER DEFAULT 0 CHECK (longest_mentor_streak >= 0),
    longest_daily_streak INTEGER DEFAULT 0 CHECK (longest_daily_streak >= 0),
    last_quiz_date DATE,
    last_mentor_date DATE,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily challenges system
CREATE TABLE IF NOT EXISTS public.daily_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_type TEXT NOT NULL CHECK (challenge_type IN (
        'quick_learner', 'mentor_session', 'interview_prep', 'daily_motivation', 
        'perfect_score', 'streak_maintainer', 'skill_explorer'
    )),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    xp_reward INTEGER NOT NULL CHECK (xp_reward > 0),
    badge_reward UUID REFERENCES public.badge_definitions(id),
    target_value INTEGER DEFAULT 1, -- how many times to complete the action
    is_active BOOLEAN DEFAULT true,
    difficulty_level TEXT DEFAULT 'easy' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User daily challenge progress
CREATE TABLE IF NOT EXISTS public.user_daily_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
    current_progress INTEGER DEFAULT 0 CHECK (current_progress >= 0),
    target_progress INTEGER NOT NULL CHECK (target_progress > 0),
    completed_at TIMESTAMP WITH TIME ZONE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_DATE + INTERVAL '1 day'),
    UNIQUE(user_id, challenge_id, assigned_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_xp_level ON public.user_xp(current_level);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_badge_id ON public.user_achievements(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON public.user_achievements(earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON public.xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_action ON public.xp_transactions(action);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON public.xp_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_user_id ON public.user_daily_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_assigned_date ON public.user_daily_challenges(assigned_date);

-- Triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_xp_updated_at 
    BEFORE UPDATE ON public.user_xp
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at 
    BEFORE UPDATE ON public.user_streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_challenges ENABLE ROW LEVEL SECURITY;

-- Badge definitions and daily challenges are publicly readable
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user data
CREATE POLICY "Users can manage their own XP data" ON public.user_xp
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own XP transactions" ON public.xp_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own streaks" ON public.user_streaks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their daily challenges" ON public.user_daily_challenges
    FOR ALL USING (auth.uid() = user_id);

-- Public read access for system definitions
CREATE POLICY "Anyone can view active badge definitions" ON public.badge_definitions
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active daily challenges" ON public.daily_challenges
    FOR SELECT USING (is_active = true);

-- Insert initial badge definitions
INSERT INTO public.badge_definitions (name, description, icon_name, category, xp_reward, unlock_condition, sort_order) VALUES
    -- Mastery Badges
    ('First Steps', 'Complete your first quiz', 'baby', 'mastery', 25, '{"quiz_count": 1}', 1),
    ('Perfect Score', 'Get 100% on any quiz', 'target', 'mastery', 50, '{"perfect_scores": 1}', 2),
    ('Knowledge Seeker', 'Complete 50 learning milestones', 'book-open', 'mastery', 100, '{"learning_milestones": 50}', 3),
    ('Interview Ready', 'Complete 10 interview prep sessions', 'briefcase', 'mastery', 75, '{"interview_prep_sessions": 10}', 4),
    ('Motivated Mind', 'Complete 25 daily motivation sessions', 'heart', 'mastery', 60, '{"motivation_sessions": 25}', 5),
    
    -- Streak Badges
    ('Streak Master', 'Maintain a 7-day quiz streak', 'flame', 'streak', 100, '{"quiz_streak": 7}', 6),
    ('Dedicated Learner', 'Maintain a 30-day activity streak', 'calendar', 'streak', 200, '{"daily_streak": 30}', 7),
    
    -- Special Achievements
    ('Night Owl', 'Complete a quiz between 10PM-6AM', 'moon', 'special', 40, '{"late_night_quiz": 1}', 8),
    ('Speed Demon', 'Complete a quiz in under 5 minutes', 'zap', 'special', 50, '{"fast_quiz": 1}', 9),
    ('Comeback Kid', 'Improve quiz score by 30+ points on retake', 'trending-up', 'special', 75, '{"score_improvement": 30}', 10),
    ('Mentor&apos;s Favorite', 'Have 100+ AI mentor interactions', 'message-circle', 'special', 150, '{"mentor_chats": 100}', 11),
    ('Interview Ace', 'Complete interview prep for all skill levels', 'graduation-cap', 'special', 125, '{"interview_all_levels": 1}', 12)
    
ON CONFLICT (name) DO NOTHING;

-- Insert initial daily challenges
INSERT INTO public.daily_challenges (challenge_type, title, description, xp_reward, target_value, difficulty_level) VALUES
    ('quick_learner', 'Quick Learner', 'Complete a quiz in under 3 minutes', 75, 1, 'medium'),
    ('mentor_session', 'Mentor Wisdom', 'Have a 10-message conversation with AI mentor', 50, 10, 'easy'),
    ('interview_prep', 'Interview Ready', 'Complete an interview prep session', 60, 1, 'medium'),
    ('daily_motivation', 'Daily Inspiration', 'Get daily motivation from AI mentor', 30, 1, 'easy'),
    ('perfect_score', 'Perfection Pursuit', 'Score 100% on any quiz', 100, 1, 'hard'),
    ('streak_maintainer', 'Streak Keeper', 'Maintain your current learning streak', 40, 1, 'easy'),
    ('skill_explorer', 'Knowledge Explorer', 'Complete quizzes in 2 different skill categories', 80, 2, 'medium')
    
ON CONFLICT (challenge_type) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE public.user_xp IS 'User experience points and leveling system for DevPath Chronicles';
COMMENT ON TABLE public.badge_definitions IS 'System-wide achievement badges with unlock conditions';
COMMENT ON TABLE public.user_achievements IS 'User-earned achievements and badges';
COMMENT ON TABLE public.xp_transactions IS 'Audit trail for all XP awards and transactions';
COMMENT ON TABLE public.user_streaks IS 'User streak tracking for various activities';
COMMENT ON TABLE public.daily_challenges IS 'System-defined daily challenges for engagement';
COMMENT ON TABLE public.user_daily_challenges IS 'User progress on assigned daily challenges';
-- DevPath Chronicles Social Competition Schema
-- Phase 2: Social Competition Layer
-- Created: 2025-01-23

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Anonymous leaderboard system
CREATE TABLE IF NOT EXISTS public.leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_category TEXT NOT NULL CHECK (skill_category IN ('PHP', 'Oracle', 'General', 'Database', 'Web Development')),
    time_period TEXT NOT NULL CHECK (time_period IN ('daily', 'weekly', 'monthly', 'all_time')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    user_rank INTEGER NOT NULL CHECK (user_rank > 0),
    user_score INTEGER NOT NULL CHECK (user_score >= 0),
    anonymous_name TEXT NOT NULL, -- Generated names like "CodeNinja47", "QueryMaster12"
    xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
    quizzes_completed INTEGER DEFAULT 0 CHECK (quizzes_completed >= 0),
    perfect_scores INTEGER DEFAULT 0 CHECK (perfect_scores >= 0),
    streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, skill_category, time_period, period_start)
);

-- Guild system for study groups and communities
CREATE TABLE IF NOT EXISTS public.guilds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    skill_focus TEXT NOT NULL CHECK (skill_focus IN ('php', 'oracle', 'general', 'full_stack')),
    guild_type TEXT DEFAULT 'study_squad' CHECK (guild_type IN ('study_squad', 'skill_guild', 'mentor_circle')),
    max_members INTEGER DEFAULT 50 CHECK (max_members > 0),
    current_members INTEGER DEFAULT 0 CHECK (current_members >= 0),
    is_public BOOLEAN DEFAULT true,
    join_code TEXT UNIQUE, -- Optional join code for private guilds
    guild_level INTEGER DEFAULT 1 CHECK (guild_level > 0),
    total_guild_xp INTEGER DEFAULT 0 CHECK (total_guild_xp >= 0),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guild membership management
CREATE TABLE IF NOT EXISTS public.guild_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'leader', 'founder')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    contribution_xp INTEGER DEFAULT 0 CHECK (contribution_xp >= 0),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(guild_id, user_id)
);

-- Enhanced daily challenges system
CREATE TABLE IF NOT EXISTS public.challenge_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_type TEXT NOT NULL CHECK (challenge_type IN (
        'quick_learner', 'mentor_session', 'interview_prep', 'daily_motivation', 
        'perfect_score', 'streak_maintainer', 'skill_explorer', 'guild_contributor',
        'social_learner', 'consistency_champion'
    )),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    xp_reward INTEGER NOT NULL CHECK (xp_reward > 0),
    badge_reward UUID REFERENCES public.badge_definitions(id),
    target_value INTEGER DEFAULT 1 CHECK (target_value > 0),
    difficulty_level TEXT DEFAULT 'easy' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    skill_category TEXT CHECK (skill_category IN ('PHP', 'Oracle', 'General')),
    is_social BOOLEAN DEFAULT false, -- Requires guild membership or social interaction
    frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'special')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User assigned daily challenges (enhanced from Phase 1)
CREATE TABLE IF NOT EXISTS public.user_daily_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.challenge_templates(id) ON DELETE CASCADE,
    current_progress INTEGER DEFAULT 0 CHECK (current_progress >= 0),
    target_progress INTEGER NOT NULL CHECK (target_progress > 0),
    completed_at TIMESTAMP WITH TIME ZONE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_DATE + INTERVAL '1 day'),
    guild_challenge BOOLEAN DEFAULT false, -- Part of guild challenge
    guild_id UUID REFERENCES public.guilds(id) ON DELETE SET NULL,
    bonus_xp INTEGER DEFAULT 0 CHECK (bonus_xp >= 0), -- Extra XP for guild challenges
    UNIQUE(user_id, template_id, assigned_date)
);

-- Guild challenges and competitions
CREATE TABLE IF NOT EXISTS public.guild_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
    challenge_title TEXT NOT NULL,
    challenge_description TEXT NOT NULL,
    challenge_type TEXT NOT NULL,
    target_metric TEXT NOT NULL, -- 'total_xp', 'quizzes_completed', 'perfect_scores', etc.
    target_value INTEGER NOT NULL CHECK (target_value > 0),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reward_xp INTEGER DEFAULT 0 CHECK (reward_xp >= 0),
    reward_badge_id UUID REFERENCES public.badge_definitions(id),
    current_progress INTEGER DEFAULT 0 CHECK (current_progress >= 0),
    participants INTEGER DEFAULT 0 CHECK (participants >= 0),
    is_completed BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social achievements and interactions
CREATE TABLE IF NOT EXISTS public.social_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for guild-wide interactions
    interaction_type TEXT NOT NULL CHECK (interaction_type IN (
        'guild_join', 'guild_leave', 'challenge_complete', 'help_request', 
        'encouragement', 'achievement_celebrate', 'study_buddy_request'
    )),
    guild_id UUID REFERENCES public.guilds(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anonymous name generation for leaderboards
CREATE TABLE IF NOT EXISTS public.anonymous_names (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_category TEXT NOT NULL,
    anonymous_name TEXT NOT NULL,
    name_seed INTEGER NOT NULL, -- For consistent name generation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, skill_category)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_leaderboards_skill_period ON public.leaderboards(skill_category, time_period, period_start);
CREATE INDEX IF NOT EXISTS idx_leaderboards_rank ON public.leaderboards(user_rank);
CREATE INDEX IF NOT EXISTS idx_leaderboards_score ON public.leaderboards(user_score DESC);
CREATE INDEX IF NOT EXISTS idx_guild_memberships_guild_id ON public.guild_memberships(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_memberships_user_id ON public.guild_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_guild_memberships_active ON public.guild_memberships(is_active, last_active_at);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_user_date ON public.user_daily_challenges(user_id, assigned_date);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_guild ON public.user_daily_challenges(guild_id, assigned_date) WHERE guild_challenge = true;
CREATE INDEX IF NOT EXISTS idx_guild_challenges_active ON public.guild_challenges(guild_id, end_date) WHERE is_completed = false;
CREATE INDEX IF NOT EXISTS idx_social_interactions_guild ON public.social_interactions(guild_id, created_at);

-- Triggers for updated_at columns
CREATE TRIGGER update_leaderboards_updated_at 
    BEFORE UPDATE ON public.leaderboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guilds_updated_at 
    BEFORE UPDATE ON public.guilds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_names ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Leaderboards are publicly viewable (anonymous)
CREATE POLICY "Anyone can view leaderboards" ON public.leaderboards
    FOR SELECT USING (true);

-- Users can only insert their own leaderboard entries (system managed)
CREATE POLICY "System can manage leaderboard entries" ON public.leaderboards
    FOR ALL USING (true); -- Will be restricted to service role in practice

-- Guilds are publicly viewable if public
CREATE POLICY "Anyone can view public guilds" ON public.guilds
    FOR SELECT USING (is_public = true);

-- Guild members can view private guilds
CREATE POLICY "Guild members can view their guilds" ON public.guilds
    FOR SELECT USING (
        NOT is_public AND id IN (
            SELECT guild_id FROM public.guild_memberships 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Guild founders can manage their guilds
CREATE POLICY "Guild founders can manage their guilds" ON public.guilds
    FOR ALL USING (created_by = auth.uid());

-- Guild membership policies
CREATE POLICY "Users can view guild memberships for their guilds" ON public.guild_memberships
    FOR SELECT USING (
        user_id = auth.uid() OR 
        guild_id IN (
            SELECT guild_id FROM public.guild_memberships 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can manage their own guild memberships" ON public.guild_memberships
    FOR ALL USING (user_id = auth.uid());

-- Challenge templates are publicly readable
CREATE POLICY "Anyone can view active challenge templates" ON public.challenge_templates
    FOR SELECT USING (is_active = true);

-- Users can manage their own daily challenges
CREATE POLICY "Users can manage their own daily challenges" ON public.user_daily_challenges
    FOR ALL USING (user_id = auth.uid());

-- Guild challenge policies
CREATE POLICY "Guild members can view guild challenges" ON public.guild_challenges
    FOR SELECT USING (
        guild_id IN (
            SELECT guild_id FROM public.guild_memberships 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Guild leaders can manage guild challenges" ON public.guild_challenges
    FOR ALL USING (
        created_by = auth.uid() OR
        guild_id IN (
            SELECT guild_id FROM public.guild_memberships 
            WHERE user_id = auth.uid() AND role IN ('leader', 'founder') AND is_active = true
        )
    );

-- Social interaction policies
CREATE POLICY "Users can view interactions involving them" ON public.social_interactions
    FOR SELECT USING (
        from_user_id = auth.uid() OR 
        to_user_id = auth.uid() OR
        (guild_id IS NOT NULL AND guild_id IN (
            SELECT guild_id FROM public.guild_memberships 
            WHERE user_id = auth.uid() AND is_active = true
        ))
    );

CREATE POLICY "Users can create their own interactions" ON public.social_interactions
    FOR INSERT WITH CHECK (from_user_id = auth.uid());

-- Anonymous names policy
CREATE POLICY "Users can manage their own anonymous names" ON public.anonymous_names
    FOR ALL USING (user_id = auth.uid());

-- Insert initial challenge templates
INSERT INTO public.challenge_templates (challenge_type, title, description, xp_reward, target_value, difficulty_level, skill_category, is_social) VALUES
    -- Individual challenges
    ('quick_learner', 'Speed Demon', 'Complete a quiz in under 3 minutes', 75, 1, 'medium', 'General', false),
    ('mentor_session', 'Seek Wisdom', 'Have a conversation with the AI mentor', 50, 1, 'easy', 'General', false),
    ('interview_prep', 'Interview Ready', 'Complete an interview preparation session', 60, 1, 'medium', 'General', false),
    ('daily_motivation', 'Daily Boost', 'Get your daily motivation from the AI mentor', 30, 1, 'easy', 'General', false),
    ('perfect_score', 'Perfectionist', 'Score 100% on any quiz', 100, 1, 'hard', 'General', false),
    ('streak_maintainer', 'Consistency King', 'Maintain your learning streak', 40, 1, 'easy', 'General', false),
    ('skill_explorer', 'Knowledge Seeker', 'Complete quizzes in 2 different skill categories', 80, 2, 'medium', 'General', false),
    
    -- Social challenges  
    ('guild_contributor', 'Team Player', 'Contribute 100 XP to your guild today', 60, 100, 'medium', 'General', true),
    ('social_learner', 'Study Buddy', 'Complete a challenge while in a study squad', 70, 1, 'medium', 'General', true),
    ('consistency_champion', 'Guild Streak Master', 'Help your guild maintain a 7-day activity streak', 120, 7, 'hard', 'General', true),
    
    -- Skill-specific challenges
    ('skill_explorer', 'PHP Master Path', 'Complete 3 PHP quizzes today', 90, 3, 'medium', 'PHP', false),
    ('skill_explorer', 'Oracle Database Dive', 'Complete 3 Oracle quizzes today', 90, 3, 'medium', 'Oracle', false)
    
ON CONFLICT (challenge_type, title) DO NOTHING;

-- Insert sample guilds
INSERT INTO public.guilds (name, display_name, description, skill_focus, guild_type, max_members, created_by) VALUES
    ('php-fellowship', 'PHP Fellowship', 'Master PHP development together through collaborative learning and shared challenges', 'php', 'skill_guild', 100, (SELECT id FROM auth.users LIMIT 1)),
    ('oracle-guild', 'Oracle Masters Guild', 'Database professionals advancing their Oracle skills through teamwork', 'oracle', 'skill_guild', 100, (SELECT id FROM auth.users LIMIT 1)),
    ('study-squad-alpha', 'Study Squad Alpha', 'Small intensive study group for accelerated learning', 'general', 'study_squad', 10, (SELECT id FROM auth.users LIMIT 1)),
    ('mentor-circle-pro', 'Pro Mentor Circle', 'Advanced developers mentoring and learning from each other', 'full_stack', 'mentor_circle', 25, (SELECT id FROM auth.users LIMIT 1))
    
ON CONFLICT (name) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE public.leaderboards IS 'Anonymous leaderboard system for competitive motivation';
COMMENT ON TABLE public.guilds IS 'Guild system for study groups and skill-based communities';
COMMENT ON TABLE public.guild_memberships IS 'User membership in guilds with roles and contributions';
COMMENT ON TABLE public.challenge_templates IS 'Template definitions for daily and special challenges';
COMMENT ON TABLE public.user_daily_challenges IS 'User-assigned daily challenges with progress tracking';
COMMENT ON TABLE public.guild_challenges IS 'Guild-wide challenges and competitions';
COMMENT ON TABLE public.social_interactions IS 'Social interactions between users and guilds';
COMMENT ON TABLE public.anonymous_names IS 'Anonymous name mapping for leaderboard privacy';
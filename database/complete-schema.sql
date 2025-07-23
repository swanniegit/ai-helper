-- Complete Database Schema for AI Helper Learning Path System
-- This file contains all necessary tables, views, and functions for the application to function

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- AUTHENTICATION TABLES
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions for authentication
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- LEARNING PATH SYSTEM TABLES
-- ============================================================================

-- Learning paths table
CREATE TABLE IF NOT EXISTS public.learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    career_path VARCHAR(50) CHECK (career_path IN ('PHP', 'Oracle')),
    current_level VARCHAR(50) CHECK (current_level IN ('Junior', 'Intermediate', 'Senior')),
    target_level VARCHAR(50) CHECK (target_level IN ('Junior', 'Intermediate', 'Senior')),
    timeline_months INTEGER NOT NULL DEFAULT 12,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills assessment data
CREATE TABLE IF NOT EXISTS public.skill_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    skill_level VARCHAR(50) NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Career goals
CREATE TABLE IF NOT EXISTS public.career_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
    goal_text TEXT NOT NULL,
    priority INTEGER DEFAULT 1,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Priority areas
CREATE TABLE IF NOT EXISTS public.priority_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
    area_name VARCHAR(255) NOT NULL,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated learning plans
CREATE TABLE IF NOT EXISTS public.learning_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    estimated_hours INTEGER NOT NULL,
    plan_data JSONB NOT NULL, -- Stores the full generated plan structure
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plan quarters
CREATE TABLE IF NOT EXISTS public.plan_quarters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_plan_id UUID NOT NULL REFERENCES public.learning_plans(id) ON DELETE CASCADE,
    quarter_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    objectives JSONB NOT NULL, -- Array of objectives
    resources JSONB NOT NULL, -- Array of resources
    milestones JSONB NOT NULL, -- Array of milestones
    estimated_hours INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Progress tracking
CREATE TABLE IF NOT EXISTS public.progress_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
    quarter_id UUID REFERENCES public.plan_quarters(id) ON DELETE SET NULL,
    milestone_id VARCHAR(255), -- Reference to milestone in quarter
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    notes TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- QUIZ SYSTEM TABLES
-- ============================================================================

-- Quiz templates table
CREATE TABLE IF NOT EXISTS public.quiz_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    quiz_type TEXT NOT NULL CHECK (quiz_type IN ('skills_assessment', 'progress_check', 'practice', 'certification')),
    skill_category TEXT NOT NULL,
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    question_count INTEGER NOT NULL DEFAULT 15,
    time_limit_minutes INTEGER DEFAULT 30,
    passing_score INTEGER DEFAULT 70,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question bank table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID REFERENCES public.quiz_templates(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'code_snippet')),
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    skill_tags TEXT[],
    code_snippet TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz results table
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.quiz_templates(id) ON DELETE CASCADE NOT NULL,
    quiz_type TEXT NOT NULL CHECK (quiz_type IN ('skills_assessment', 'progress_check', 'practice', 'certification')),
    questions JSONB NOT NULL,
    user_answers JSONB NOT NULL,
    correct_answers JSONB NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage_score NUMERIC(5,2) NOT NULL,
    time_taken_seconds INTEGER,
    difficulty_level TEXT NOT NULL,
    skill_category TEXT NOT NULL,
    passed BOOLEAN NOT NULL,
    feedback JSONB,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz sessions table
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.quiz_templates(id) ON DELETE CASCADE NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    questions JSONB NOT NULL,
    current_question_index INTEGER DEFAULT 0,
    answers JSONB DEFAULT '[]',
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '2 hours')
);

-- Quiz analytics table
CREATE TABLE IF NOT EXISTS public.quiz_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    quiz_result_id UUID REFERENCES public.quiz_results(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
    user_answer TEXT,
    is_correct BOOLEAN NOT NULL,
    time_spent_seconds INTEGER,
    difficulty_level TEXT NOT NULL,
    skill_tag TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User quiz preferences table
CREATE TABLE IF NOT EXISTS public.user_quiz_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    preferred_difficulty TEXT DEFAULT 'intermediate' CHECK (preferred_difficulty IN ('beginner', 'intermediate', 'advanced')),
    preferred_question_count INTEGER DEFAULT 15,
    preferred_time_limit INTEGER DEFAULT 30,
    notification_enabled BOOLEAN DEFAULT true,
    auto_retake_failed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================================
-- GAMIFICATION SYSTEM TABLES
-- ============================================================================

-- User XP and leveling system
CREATE TABLE IF NOT EXISTS public.user_xp (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
    current_level TEXT DEFAULT 'Code Apprentice' CHECK (current_level IN (
        'Code Apprentice', 'Bug Hunter', 'Logic Architect', 'Code Wizard', 'Dev Sage'
    )),
    level_progress DECIMAL(5,2) DEFAULT 0.00 CHECK (level_progress >= 0 AND level_progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badge definitions
CREATE TABLE IF NOT EXISTS public.badge_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('mastery', 'special', 'social', 'streak')),
    xp_reward INTEGER DEFAULT 0 CHECK (xp_reward >= 0),
    unlock_condition JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notification_sent BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, badge_id)
);

-- XP transaction log
CREATE TABLE IF NOT EXISTS public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    xp_amount INTEGER NOT NULL CHECK (xp_amount > 0),
    source_id UUID,
    source_type TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User streak tracking
CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
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

-- ============================================================================
-- SOCIAL COMPETITION TABLES
-- ============================================================================

-- Anonymous leaderboard system
CREATE TABLE IF NOT EXISTS public.leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    skill_category TEXT NOT NULL CHECK (skill_category IN ('PHP', 'Oracle', 'General', 'Database', 'Web Development')),
    time_period TEXT NOT NULL CHECK (time_period IN ('daily', 'weekly', 'monthly', 'all_time')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    user_rank INTEGER NOT NULL CHECK (user_rank > 0),
    user_score INTEGER NOT NULL CHECK (user_score >= 0),
    anonymous_name TEXT NOT NULL,
    xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
    quizzes_completed INTEGER DEFAULT 0 CHECK (quizzes_completed >= 0),
    perfect_scores INTEGER DEFAULT 0 CHECK (perfect_scores >= 0),
    streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, skill_category, time_period, period_start)
);

-- Guild system
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
    join_code TEXT UNIQUE,
    guild_level INTEGER DEFAULT 1 CHECK (guild_level > 0),
    total_guild_xp INTEGER DEFAULT 0 CHECK (total_guild_xp >= 0),
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guild membership management
CREATE TABLE IF NOT EXISTS public.guild_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'leader', 'founder')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    contribution_xp INTEGER DEFAULT 0 CHECK (contribution_xp >= 0),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(guild_id, user_id)
);

-- Challenge templates
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
    is_social BOOLEAN DEFAULT false,
    frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'special')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User daily challenges
CREATE TABLE IF NOT EXISTS public.user_daily_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.challenge_templates(id) ON DELETE CASCADE,
    current_progress INTEGER DEFAULT 0 CHECK (current_progress >= 0),
    target_progress INTEGER NOT NULL CHECK (target_progress > 0),
    completed_at TIMESTAMP WITH TIME ZONE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_DATE + INTERVAL '1 day'),
    guild_challenge BOOLEAN DEFAULT false,
    guild_id UUID REFERENCES public.guilds(id) ON DELETE SET NULL,
    bonus_xp INTEGER DEFAULT 0 CHECK (bonus_xp >= 0),
    UNIQUE(user_id, template_id, assigned_date)
);

-- Anonymous names for leaderboards
CREATE TABLE IF NOT EXISTS public.anonymous_names (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    skill_category TEXT NOT NULL CHECK (skill_category IN ('PHP', 'Oracle', 'General', 'Database', 'Web Development')),
    anonymous_name TEXT NOT NULL,
    name_seed INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, skill_category)
);

-- ============================================================================
-- SEASONAL EVENTS SYSTEM TABLES
-- ============================================================================

-- Seasonal events
CREATE TABLE IF NOT EXISTS public.seasonal_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_key VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL, -- 'individual_goal', 'community_goal', 'special_challenge'
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    xp_multiplier DECIMAL(3,2) DEFAULT 1.0,
    focus_skill_category VARCHAR(50),
    special_rewards JSONB,
    community_target INTEGER,
    community_progress INTEGER DEFAULT 0,
    theme_color VARCHAR(7),
    icon_name VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User seasonal progress
CREATE TABLE IF NOT EXISTS public.user_seasonal_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    seasonal_event_id UUID NOT NULL REFERENCES public.seasonal_events(id) ON DELETE CASCADE,
    xp_earned INTEGER DEFAULT 0,
    challenges_completed INTEGER DEFAULT 0,
    participation_score INTEGER DEFAULT 0,
    special_rewards JSONB,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, seasonal_event_id)
);

-- ============================================================================
-- QUEST SYSTEM TABLES
-- ============================================================================

-- Quest templates
CREATE TABLE IF NOT EXISTS public.quest_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_key VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    narrative_text TEXT,
    quest_type VARCHAR(50) NOT NULL CHECK (quest_type IN ('main_story', 'side_quest', 'daily', 'special', 'social')),
    required_level INTEGER DEFAULT 1,
    xp_reward INTEGER DEFAULT 100,
    quest_giver_name VARCHAR(255),
    quest_giver_avatar VARCHAR(10),
    estimated_duration_hours INTEGER DEFAULT 1,
    difficulty_rating INTEGER DEFAULT 1 CHECK (difficulty_rating BETWEEN 1 AND 5),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quest objectives
CREATE TABLE IF NOT EXISTS public.quest_objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_template_id UUID NOT NULL REFERENCES public.quest_templates(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_value INTEGER NOT NULL DEFAULT 1,
    objective_order INTEGER DEFAULT 0,
    is_optional BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quest steps
CREATE TABLE IF NOT EXISTS public.quest_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_template_id UUID NOT NULL REFERENCES public.quest_templates(id) ON DELETE CASCADE,
    step_key VARCHAR(100) NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    step_description TEXT NOT NULL,
    step_narrative TEXT,
    step_order INTEGER NOT NULL DEFAULT 0,
    is_optional BOOLEAN DEFAULT false,
    step_xp_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quest NPCs
CREATE TABLE IF NOT EXISTS public.quest_npcs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    npc_key VARCHAR(100) UNIQUE NOT NULL,
    npc_name VARCHAR(255) NOT NULL,
    npc_title VARCHAR(255),
    npc_description TEXT,
    npc_personality TEXT,
    npc_avatar_emoji VARCHAR(10),
    npc_avatar_color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User quests
CREATE TABLE IF NOT EXISTS public.user_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    quest_template_id UUID NOT NULL REFERENCES public.quest_templates(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'active', 'completed', 'failed')),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, quest_template_id)
);

-- User quest objectives progress
CREATE TABLE IF NOT EXISTS public.user_quest_objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_quest_id UUID NOT NULL REFERENCES public.user_quests(id) ON DELETE CASCADE,
    objective_id UUID NOT NULL REFERENCES public.quest_objectives(id) ON DELETE CASCADE,
    current_progress INTEGER DEFAULT 0,
    target_value INTEGER NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SKILL TREE SYSTEM TABLES
-- ============================================================================

-- Skill tree nodes
CREATE TABLE IF NOT EXISTS public.skill_tree_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_key VARCHAR(100) UNIQUE NOT NULL,
    node_name VARCHAR(255) NOT NULL,
    node_description TEXT,
    skill_category VARCHAR(50) NOT NULL,
    difficulty_level VARCHAR(50) NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    xp_requirement INTEGER DEFAULT 0,
    parent_node_id UUID REFERENCES public.skill_tree_nodes(id) ON DELETE CASCADE,
    node_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User skill progress
CREATE TABLE IF NOT EXISTS public.user_skill_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    skill_node_id UUID NOT NULL REFERENCES public.skill_tree_nodes(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    is_unlocked BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_node_id)
);

-- ============================================================================
-- SOCIAL INTERACTIONS TABLE
-- ============================================================================

-- Social interactions
CREATE TABLE IF NOT EXISTS public.social_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('guild_join', 'guild_leave', 'challenge_complete', 'quest_help', 'mentor_request')),
    guild_id UUID REFERENCES public.guilds(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- DAILY CHALLENGES TABLE (Alternative name)
-- ============================================================================

-- Daily challenges (alternative to user_daily_challenges)
CREATE TABLE IF NOT EXISTS public.daily_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    challenge_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    current_progress INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 50,
    assigned_date DATE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- LEADERBOARD ENTRIES TABLE (Alternative name)
-- ============================================================================

-- Leaderboard entries (alternative to leaderboards)
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    skill_category VARCHAR(50) NOT NULL,
    time_period VARCHAR(20) NOT NULL CHECK (time_period IN ('daily', 'weekly', 'monthly', 'all_time')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    user_score INTEGER DEFAULT 0,
    anonymous_name VARCHAR(100),
    xp_earned INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    perfect_scores INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    user_rank INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_category, time_period, period_start)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Authentication indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);

-- Learning path indexes
CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON public.learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_career_path ON public.learning_paths(career_path);
CREATE INDEX IF NOT EXISTS idx_skill_assessments_learning_path_id ON public.skill_assessments(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_career_goals_learning_path_id ON public.career_goals(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_priority_areas_learning_path_id ON public.priority_areas(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_learning_plans_learning_path_id ON public.learning_plans(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_plan_quarters_learning_plan_id ON public.plan_quarters(learning_plan_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_learning_path_id ON public.progress_tracking(learning_path_id);

-- Quiz indexes
CREATE INDEX IF NOT EXISTS idx_quiz_templates_skill_category ON public.quiz_templates(skill_category);
CREATE INDEX IF NOT EXISTS idx_quiz_templates_difficulty ON public.quiz_templates(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_template_id ON public.quiz_questions(template_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON public.quiz_questions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_skill_tags ON public.quiz_questions USING GIN(skill_tags);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_template_id ON public.quiz_results(template_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_skill_category ON public.quiz_results(skill_category);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_token ON public.quiz_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_quiz_analytics_user_id ON public.quiz_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_analytics_quiz_result_id ON public.quiz_analytics(quiz_result_id);

-- Gamification indexes
CREATE INDEX IF NOT EXISTS idx_user_xp_level ON public.user_xp(current_level);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_badge_id ON public.user_achievements(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON public.user_achievements(earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON public.xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_action ON public.xp_transactions(action);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON public.xp_transactions(created_at DESC);

-- Social competition indexes
CREATE INDEX IF NOT EXISTS idx_leaderboards_skill_period ON public.leaderboards(skill_category, time_period, period_start);
CREATE INDEX IF NOT EXISTS idx_leaderboards_rank ON public.leaderboards(user_rank);
CREATE INDEX IF NOT EXISTS idx_leaderboards_score ON public.leaderboards(user_score DESC);
CREATE INDEX IF NOT EXISTS idx_guild_memberships_guild_id ON public.guild_memberships(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_memberships_user_id ON public.guild_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_guild_memberships_active ON public.guild_memberships(is_active, last_active_at);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_user_date ON public.user_daily_challenges(user_id, assigned_date);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_guild ON public.user_daily_challenges(guild_id, assigned_date) WHERE guild_challenge = true;
CREATE INDEX IF NOT EXISTS idx_anonymous_names_user_category ON public.anonymous_names(user_id, skill_category);

-- Seasonal events indexes
CREATE INDEX IF NOT EXISTS idx_seasonal_events_active ON public.seasonal_events(is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_seasonal_events_type ON public.seasonal_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_seasonal_progress_user_id ON public.user_seasonal_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_seasonal_progress_event_id ON public.user_seasonal_progress(seasonal_event_id);
CREATE INDEX IF NOT EXISTS idx_user_seasonal_progress_joined_at ON public.user_seasonal_progress(joined_at DESC);

-- Quest system indexes
CREATE INDEX IF NOT EXISTS idx_quest_templates_type ON public.quest_templates(quest_type);
CREATE INDEX IF NOT EXISTS idx_quest_templates_active ON public.quest_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_quest_objectives_template_id ON public.quest_objectives(quest_template_id);
CREATE INDEX IF NOT EXISTS idx_quest_steps_template_id ON public.quest_steps(quest_template_id);
CREATE INDEX IF NOT EXISTS idx_quest_steps_order ON public.quest_steps(step_order);
CREATE INDEX IF NOT EXISTS idx_user_quests_user_id ON public.user_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_status ON public.user_quests(status);
CREATE INDEX IF NOT EXISTS idx_user_quests_template_id ON public.user_quests(quest_template_id);
CREATE INDEX IF NOT EXISTS idx_user_quest_objectives_quest_id ON public.user_quest_objectives(user_quest_id);
CREATE INDEX IF NOT EXISTS idx_user_quest_objectives_objective_id ON public.user_quest_objectives(objective_id);

-- Skill tree indexes
CREATE INDEX IF NOT EXISTS idx_skill_tree_nodes_category ON public.skill_tree_nodes(skill_category);
CREATE INDEX IF NOT EXISTS idx_skill_tree_nodes_parent ON public.skill_tree_nodes(parent_node_id);
CREATE INDEX IF NOT EXISTS idx_skill_tree_nodes_order ON public.skill_tree_nodes(node_order);
CREATE INDEX IF NOT EXISTS idx_user_skill_progress_user_id ON public.user_skill_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_progress_node_id ON public.user_skill_progress(skill_node_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_progress_completed ON public.user_skill_progress(is_completed);

-- Social interactions indexes
CREATE INDEX IF NOT EXISTS idx_social_interactions_from_user ON public.social_interactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_social_interactions_to_user ON public.social_interactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_social_interactions_type ON public.social_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_social_interactions_guild ON public.social_interactions(guild_id);
CREATE INDEX IF NOT EXISTS idx_social_interactions_created_at ON public.social_interactions(created_at DESC);

-- Daily challenges indexes
CREATE INDEX IF NOT EXISTS idx_daily_challenges_user_id ON public.daily_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON public.daily_challenges(assigned_date);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_completed ON public.daily_challenges(is_completed);

-- Leaderboard entries indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_user_id ON public.leaderboard_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_category_period ON public.leaderboard_entries(skill_category, time_period, period_start);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_score ON public.leaderboard_entries(user_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_rank ON public.leaderboard_entries(user_rank);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON public.user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON public.learning_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_goals_updated_at BEFORE UPDATE ON public.career_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_tracking_updated_at BEFORE UPDATE ON public.progress_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quiz_templates_updated_at BEFORE UPDATE ON public.quiz_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON public.quiz_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_quiz_preferences_updated_at BEFORE UPDATE ON public.user_quiz_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_xp_updated_at BEFORE UPDATE ON public.user_xp FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON public.user_streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leaderboards_updated_at BEFORE UPDATE ON public.leaderboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guilds_updated_at BEFORE UPDATE ON public.guilds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seasonal_events_updated_at BEFORE UPDATE ON public.seasonal_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Quest system triggers
CREATE TRIGGER update_quest_templates_updated_at BEFORE UPDATE ON public.quest_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_quests_updated_at BEFORE UPDATE ON public.user_quests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_quest_objectives_updated_at BEFORE UPDATE ON public.user_quest_objectives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Skill tree triggers
CREATE TRIGGER update_user_skill_progress_updated_at BEFORE UPDATE ON public.user_skill_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Daily challenges triggers
CREATE TRIGGER update_daily_challenges_updated_at BEFORE UPDATE ON public.daily_challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Leaderboard entries triggers
CREATE TRIGGER update_leaderboard_entries_updated_at BEFORE UPDATE ON public.leaderboard_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priority_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_quarters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_seasonal_progress ENABLE ROW LEVEL SECURITY;

-- Quest system RLS
ALTER TABLE public.quest_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quest_objectives ENABLE ROW LEVEL SECURITY;

-- Skill tree RLS
ALTER TABLE public.skill_tree_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_progress ENABLE ROW LEVEL SECURITY;

-- Social interactions RLS
ALTER TABLE public.social_interactions ENABLE ROW LEVEL SECURITY;

-- Daily challenges RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

-- Leaderboard entries RLS
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Sessions policies
CREATE POLICY "Users can manage own sessions" ON public.user_sessions FOR ALL USING (auth.uid() = user_id);

-- Learning paths policies
CREATE POLICY "Users can view own learning paths" ON public.learning_paths FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can create own learning paths" ON public.learning_paths FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own learning paths" ON public.learning_paths FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own learning paths" ON public.learning_paths FOR DELETE USING (auth.uid() = user_id);

-- Related tables policies (cascade from learning_paths)
CREATE POLICY "Users can manage own skill assessments" ON public.skill_assessments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.learning_paths WHERE learning_paths.id = skill_assessments.learning_path_id AND learning_paths.user_id = auth.uid())
);

CREATE POLICY "Users can manage own career goals" ON public.career_goals FOR ALL USING (
    EXISTS (SELECT 1 FROM public.learning_paths WHERE learning_paths.id = career_goals.learning_path_id AND learning_paths.user_id = auth.uid())
);

CREATE POLICY "Users can manage own priority areas" ON public.priority_areas FOR ALL USING (
    EXISTS (SELECT 1 FROM public.learning_paths WHERE learning_paths.id = priority_areas.learning_path_id AND learning_paths.user_id = auth.uid())
);

CREATE POLICY "Users can manage own learning plans" ON public.learning_plans FOR ALL USING (
    EXISTS (SELECT 1 FROM public.learning_paths WHERE learning_paths.id = learning_plans.learning_path_id AND learning_paths.user_id = auth.uid())
);

CREATE POLICY "Users can manage own plan quarters" ON public.plan_quarters FOR ALL USING (
    EXISTS (SELECT 1 FROM public.learning_plans lp JOIN public.learning_paths lpath ON lp.learning_path_id = lpath.id WHERE lp.id = plan_quarters.learning_plan_id AND lpath.user_id = auth.uid())
);

CREATE POLICY "Users can manage own progress tracking" ON public.progress_tracking FOR ALL USING (
    EXISTS (SELECT 1 FROM public.learning_paths WHERE learning_paths.id = progress_tracking.learning_path_id AND learning_paths.user_id = auth.uid())
);

-- Quiz policies
CREATE POLICY "Users can view quiz templates" ON public.quiz_templates FOR SELECT USING (true);
CREATE POLICY "Users can view quiz questions" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Users can manage own quiz results" ON public.quiz_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own quiz sessions" ON public.quiz_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own quiz analytics" ON public.quiz_analytics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own quiz preferences" ON public.user_quiz_preferences FOR ALL USING (auth.uid() = user_id);

-- Gamification policies
CREATE POLICY "Users can view badge definitions" ON public.badge_definitions FOR SELECT USING (true);
CREATE POLICY "Users can manage own XP" ON public.user_xp FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own XP transactions" ON public.xp_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own streaks" ON public.user_streaks FOR ALL USING (auth.uid() = user_id);

-- Social competition policies
CREATE POLICY "Users can view leaderboards" ON public.leaderboards FOR SELECT USING (true);
CREATE POLICY "Users can manage own leaderboard entries" ON public.leaderboards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view public guilds" ON public.guilds FOR SELECT USING (is_public = true);
CREATE POLICY "Users can manage own guild memberships" ON public.guild_memberships FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view challenge templates" ON public.challenge_templates FOR SELECT USING (true);
CREATE POLICY "Users can manage own daily challenges" ON public.user_daily_challenges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own anonymous names" ON public.anonymous_names FOR ALL USING (auth.uid() = user_id);

-- Seasonal events policies
CREATE POLICY "Users can view active seasonal events" ON public.seasonal_events FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage own seasonal progress" ON public.user_seasonal_progress FOR ALL USING (auth.uid() = user_id);

-- Quest system policies
CREATE POLICY "Users can view quest templates" ON public.quest_templates FOR SELECT USING (true);
CREATE POLICY "Users can view quest objectives" ON public.quest_objectives FOR SELECT USING (true);
CREATE POLICY "Users can view quest steps" ON public.quest_steps FOR SELECT USING (true);
CREATE POLICY "Users can view quest NPCs" ON public.quest_npcs FOR SELECT USING (true);
CREATE POLICY "Users can manage own quests" ON public.user_quests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own quest objectives" ON public.user_quest_objectives FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_quests WHERE user_quests.id = user_quest_objectives.user_quest_id AND user_quests.user_id = auth.uid())
);

-- Skill tree policies
CREATE POLICY "Users can view skill tree nodes" ON public.skill_tree_nodes FOR SELECT USING (true);
CREATE POLICY "Users can manage own skill progress" ON public.user_skill_progress FOR ALL USING (auth.uid() = user_id);

-- Social interactions policies
CREATE POLICY "Users can view own social interactions" ON public.social_interactions FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can create social interactions" ON public.social_interactions FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Daily challenges policies
CREATE POLICY "Users can manage own daily challenges" ON public.daily_challenges FOR ALL USING (auth.uid() = user_id);

-- Leaderboard entries policies
CREATE POLICY "Users can view leaderboard entries" ON public.leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "Users can manage own leaderboard entries" ON public.leaderboard_entries FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- AVATAR SYSTEM TABLES AND VIEWS
-- ============================================================================

-- Avatar cosmetic items
CREATE TABLE IF NOT EXISTS public.avatar_cosmetic_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_key TEXT UNIQUE NOT NULL,
  item_name TEXT NOT NULL,
  item_description TEXT NOT NULL,
  item_category TEXT NOT NULL CHECK (item_category IN ('hair_style', 'hair_color', 'clothing_style', 'clothing_color', 'accessories', 'background_theme')),
  required_level INTEGER DEFAULT 1,
  required_xp INTEGER DEFAULT 0,
  required_achievement_id UUID,
  required_skill_completion TEXT,
  unlock_cost INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  is_default BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  season_exclusive TEXT,
  item_data JSONB NOT NULL,
  preview_image TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User avatar items
CREATE TABLE IF NOT EXISTS public.user_avatar_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.avatar_cosmetic_items(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unlock_method TEXT DEFAULT 'achievement',
  UNIQUE(user_id, item_id)
);

-- Avatar presets
CREATE TABLE IF NOT EXISTS public.avatar_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  preset_key TEXT UNIQUE NOT NULL,
  preset_name TEXT NOT NULL,
  preset_description TEXT NOT NULL,
  avatar_type TEXT NOT NULL CHECK (avatar_type IN ('developer', 'architect', 'specialist', 'mentor')),
  default_customization JSONB NOT NULL,
  required_level INTEGER DEFAULT 1,
  required_skills TEXT[],
  is_starter_preset BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Avatar titles
CREATE TABLE IF NOT EXISTS public.avatar_titles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_key TEXT UNIQUE NOT NULL,
  title_name TEXT NOT NULL,
  title_description TEXT NOT NULL,
  title_type TEXT DEFAULT 'achievement' CHECK (title_type IN ('achievement', 'skill', 'seasonal', 'social', 'special')),
  required_achievement_id UUID,
  required_skill_path TEXT,
  required_guild_rank INTEGER,
  required_seasonal_event TEXT,
  custom_requirement TEXT,
  title_color TEXT DEFAULT 'blue',
  title_rarity TEXT DEFAULT 'common' CHECK (title_rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  title_icon TEXT DEFAULT 'award',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User avatar titles
CREATE TABLE IF NOT EXISTS public.user_avatar_titles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title_id UUID REFERENCES public.avatar_titles(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT false,
  UNIQUE(user_id, title_id)
);

-- Avatar interactions
CREATE TABLE IF NOT EXISTS public.avatar_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('wave', 'high_five', 'thumbs_up', 'clap', 'dance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Avatar system indexes
CREATE INDEX IF NOT EXISTS idx_avatar_cosmetic_items_category ON public.avatar_cosmetic_items(item_category);
CREATE INDEX IF NOT EXISTS idx_avatar_cosmetic_items_rarity ON public.avatar_cosmetic_items(rarity);
CREATE INDEX IF NOT EXISTS idx_user_avatar_items_user ON public.user_avatar_items(user_id);
CREATE INDEX IF NOT EXISTS idx_avatar_titles_type ON public.avatar_titles(title_type);
CREATE INDEX IF NOT EXISTS idx_user_avatar_titles_user ON public.user_avatar_titles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_avatar_titles_active ON public.user_avatar_titles(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_avatar_interactions_from ON public.avatar_interactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_avatar_interactions_to ON public.avatar_interactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_avatar_interactions_created ON public.avatar_interactions(created_at);

-- Avatar system RLS
ALTER TABLE public.avatar_cosmetic_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatar_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_interactions ENABLE ROW LEVEL SECURITY;

-- Avatar system policies
CREATE POLICY "Anyone can view cosmetic items" ON public.avatar_cosmetic_items FOR SELECT USING (true);
CREATE POLICY "Users can manage their avatar items" ON public.user_avatar_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view avatar presets" ON public.avatar_presets FOR SELECT USING (true);
CREATE POLICY "Anyone can view avatar titles" ON public.avatar_titles FOR SELECT USING (true);
CREATE POLICY "Users can manage their avatar titles" ON public.user_avatar_titles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own avatar interactions" ON public.avatar_interactions FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can create avatar interactions" ON public.avatar_interactions FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Avatar system functions
CREATE OR REPLACE FUNCTION unlock_cosmetic_items_for_user(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Unlock default items for new users
  INSERT INTO user_avatar_items (user_id, item_id, unlock_method)
  SELECT p_user_id, id, 'default'
  FROM avatar_cosmetic_items
  WHERE is_default = true
  AND id NOT IN (
    SELECT item_id FROM user_avatar_items WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_avatar_level(p_total_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Simple level calculation: every 1000 XP = 1 level
  RETURN GREATEST(1, (p_total_xp / 1000) + 1);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_avatar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Avatar system triggers
CREATE TRIGGER trigger_update_avatar_cosmetic_items_timestamp
  BEFORE UPDATE ON public.avatar_cosmetic_items
  FOR EACH ROW
  EXECUTE FUNCTION update_avatar_timestamp();

-- Avatar system views
CREATE OR REPLACE VIEW user_avatar_complete AS
SELECT 
  u.id as user_id,
  u.first_name,
  u.last_name,
  u.avatar_url,
  ux.total_xp,
  ux.current_level,
  calculate_avatar_level(ux.total_xp) as avatar_level,
  ua.title_id as active_title_id,
  at.title_name as active_title_name,
  at.title_color as active_title_color,
  at.title_rarity as active_title_rarity,
  at.title_icon as active_title_icon
FROM users u
LEFT JOIN user_xp ux ON u.id = ux.user_id
LEFT JOIN user_avatar_titles ua ON u.id = ua.user_id AND ua.is_active = true
LEFT JOIN avatar_titles at ON ua.title_id = at.id;

CREATE OR REPLACE VIEW user_cosmetic_items_status AS
SELECT 
  aci.id,
  aci.item_key,
  aci.item_name,
  aci.item_category,
  aci.item_data,
  aci.rarity,
  aci.required_level,
  aci.required_xp,
  aci.is_default,
  CASE 
    WHEN uai.id IS NOT NULL THEN true
    ELSE false
  END as is_unlocked,
  uai.unlocked_at,
  uai.unlock_method,
  CASE 
    WHEN uai.id IS NOT NULL THEN true
    WHEN ux.total_xp >= aci.required_xp AND ux.current_level >= aci.required_level THEN true
    ELSE false
  END as can_unlock
FROM avatar_cosmetic_items aci
LEFT JOIN user_avatar_items uai ON uai.item_id = aci.id
LEFT JOIN user_xp ux ON uai.user_id = ux.user_id
WHERE aci.is_active = true;

-- Avatar system RPC function
CREATE OR REPLACE FUNCTION get_user_cosmetic_items_status(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  item_key TEXT,
  item_name TEXT,
  item_category TEXT,
  item_data JSONB,
  rarity TEXT,
  required_level INTEGER,
  required_xp INTEGER,
  is_unlocked BOOLEAN,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  unlock_method TEXT,
  can_unlock BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aci.id,
    aci.item_key,
    aci.item_name,
    aci.item_category,
    aci.item_data,
    aci.rarity,
    aci.required_level,
    aci.required_xp,
    CASE WHEN uai.id IS NOT NULL THEN true ELSE false END as is_unlocked,
    uai.unlocked_at,
    uai.unlock_method,
    CASE 
      WHEN uai.id IS NOT NULL THEN true
      WHEN ux.total_xp >= aci.required_xp AND ux.current_level >= aci.required_level THEN true
      ELSE false
    END as can_unlock
  FROM avatar_cosmetic_items aci
  LEFT JOIN user_avatar_items uai ON uai.item_id = aci.id AND uai.user_id = p_user_id
  LEFT JOIN user_xp ux ON p_user_id = ux.user_id
  WHERE aci.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SKILL TREE VIEWS AND FUNCTIONS
-- ============================================================================

-- Skill nodes with prerequisites view
CREATE OR REPLACE VIEW skill_nodes_with_prerequisites AS
SELECT 
  stn.id,
  stn.node_key,
  stn.node_name,
  stn.node_description,
  stn.skill_category,
  stn.tree_path,
  stn.tier,
  stn.position_x,
  stn.position_y,
  stn.node_order,
  stn.parent_node_id,
  stn.required_xp,
  stn.required_level,
  stn.xp_reward,
  stn.is_active,
  stn.created_at,
  stn.updated_at,
  CASE 
    WHEN stn.parent_node_id IS NOT NULL THEN 
      json_build_object(
        'node_key', parent.node_key,
        'is_required', true
      )
    ELSE NULL
  END as prerequisites
FROM skill_tree_nodes stn
LEFT JOIN skill_tree_nodes parent ON stn.parent_node_id = parent.id
WHERE stn.is_active = true;

-- ============================================================================
-- QUEST SYSTEM FUNCTIONS
-- ============================================================================

-- Function to unlock available quests for a user
CREATE OR REPLACE FUNCTION unlock_available_quests(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Insert available quests for user if they don't exist
  INSERT INTO user_quests (user_id, quest_template_id, status, created_at, updated_at)
  SELECT 
    p_user_id,
    qt.id,
    'available',
    NOW(),
    NOW()
  FROM quest_templates qt
  WHERE qt.is_active = true
  AND qt.id NOT IN (
    SELECT quest_template_id FROM user_quests WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample avatar data
INSERT INTO public.avatar_cosmetic_items (item_key, item_name, item_description, item_category, rarity, is_default, item_data) VALUES
('default_hair', 'Classic Hair', 'A simple, professional hairstyle', 'hair_style', 'common', true, '{"style": "classic", "color": "brown"}'),
('default_clothing', 'Business Casual', 'Professional attire for the workplace', 'clothing_style', 'common', true, '{"style": "business_casual", "color": "navy"}'),
('default_background', 'Office Space', 'A clean office environment', 'background_theme', 'common', true, '{"theme": "office", "lighting": "natural"}');

INSERT INTO public.avatar_titles (title_key, title_name, title_description, title_type, title_color, title_rarity, title_icon) VALUES
('code_apprentice', 'Code Apprentice', 'Just starting your coding journey', 'achievement', 'blue', 'common', 'star'),
('skill_learner', 'Skill Learner', 'Completed your first skill', 'skill', 'green', 'uncommon', 'book'),
('quiz_master', 'Quiz Master', 'Completed 10 quizzes', 'achievement', 'purple', 'rare', 'trophy');

-- Success message
SELECT 'Complete database schema setup completed successfully!' as status; 
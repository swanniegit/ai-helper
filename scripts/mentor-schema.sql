-- AI Mentor Chat System Schema
-- This schema supports the AI-powered mentor chat functionality

-- Mentor conversations table
CREATE TABLE IF NOT EXISTS mentor_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentor sessions table for tracking conversation sessions
CREATE TABLE IF NOT EXISTS mentor_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('chat', 'code-review', 'interview-prep', 'daily-motivation')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    message_count INTEGER DEFAULT 0,
    context_snapshot JSONB DEFAULT '{}'
);

-- Mentor feedback table for storing user feedback on mentor responses
CREATE TABLE IF NOT EXISTS mentor_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES mentor_conversations(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    helpful BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentor insights table for tracking AI-generated insights
CREATE TABLE IF NOT EXISTS mentor_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    insight_type VARCHAR(30) NOT NULL CHECK (insight_type IN ('skill_gap', 'progress_analysis', 'career_advice', 'learning_suggestion')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    is_actionable BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    implemented_at TIMESTAMP WITH TIME ZONE
);

-- Mentor code reviews table for storing code review sessions
CREATE TABLE IF NOT EXISTS mentor_code_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(20) NOT NULL,
    code_snippet TEXT NOT NULL,
    feedback TEXT NOT NULL,
    suggestions JSONB DEFAULT '[]',
    score INTEGER CHECK (score >= 0 AND score <= 100),
    improvements JSONB DEFAULT '[]',
    review_context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentor interview sessions table
CREATE TABLE IF NOT EXISTS mentor_interview_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('technical', 'behavioral', 'mixed')),
    questions JSONB NOT NULL,
    user_answers JSONB DEFAULT '[]',
    score INTEGER CHECK (score >= 0 AND score <= 100),
    feedback TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentor daily check-ins table
CREATE TABLE IF NOT EXISTS mentor_daily_checkins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL,
    motivation_message TEXT NOT NULL,
    focus_area VARCHAR(255) NOT NULL,
    daily_challenge TEXT NOT NULL,
    encouragement TEXT NOT NULL,
    completed_challenge BOOLEAN DEFAULT false,
    mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, checkin_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mentor_conversations_user_id ON mentor_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_conversations_created_at ON mentor_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_user_id ON mentor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_type ON mentor_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_mentor_feedback_user_id ON mentor_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_insights_user_id ON mentor_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_insights_type ON mentor_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_mentor_code_reviews_user_id ON mentor_code_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_interview_sessions_user_id ON mentor_interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_daily_checkins_user_date ON mentor_daily_checkins(user_id, checkin_date);

-- Row Level Security (RLS) Policies
ALTER TABLE mentor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_code_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_daily_checkins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mentor_conversations
CREATE POLICY "Users can view their own mentor conversations" ON mentor_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mentor conversations" ON mentor_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mentor conversations" ON mentor_conversations
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for mentor_sessions
CREATE POLICY "Users can view their own mentor sessions" ON mentor_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mentor sessions" ON mentor_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mentor sessions" ON mentor_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for mentor_feedback
CREATE POLICY "Users can view their own mentor feedback" ON mentor_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mentor feedback" ON mentor_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mentor feedback" ON mentor_feedback
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for mentor_insights
CREATE POLICY "Users can view their own mentor insights" ON mentor_insights
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mentor insights" ON mentor_insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mentor insights" ON mentor_insights
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for mentor_code_reviews
CREATE POLICY "Users can view their own code reviews" ON mentor_code_reviews
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own code reviews" ON mentor_code_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own code reviews" ON mentor_code_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for mentor_interview_sessions
CREATE POLICY "Users can view their own interview sessions" ON mentor_interview_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interview sessions" ON mentor_interview_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview sessions" ON mentor_interview_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for mentor_daily_checkins
CREATE POLICY "Users can view their own daily checkins" ON mentor_daily_checkins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily checkins" ON mentor_daily_checkins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily checkins" ON mentor_daily_checkins
    FOR UPDATE USING (auth.uid() = user_id);

-- Functions for mentor system
CREATE OR REPLACE FUNCTION get_mentor_conversation_history(user_uuid UUID, limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
    id UUID,
    role VARCHAR(10),
    content TEXT,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mc.id,
        mc.role,
        mc.content,
        mc.context,
        mc.created_at
    FROM mentor_conversations mc
    WHERE mc.user_id = user_uuid
    ORDER BY mc.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's mentor context
CREATE OR REPLACE FUNCTION get_user_mentor_context(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    context JSONB;
BEGIN
    SELECT jsonb_build_object(
        'user_id', user_uuid,
        'career_path', lp.career_path,
        'current_level', lp.current_level,
        'target_level', lp.target_level,
        'skills', COALESCE(skills_array, '[]'::jsonb),
        'career_goals', COALESCE(goals_array, '[]'::jsonb),
        'learning_progress', jsonb_build_object(
            'completed_milestones', COALESCE(completed_milestones, 0),
            'total_milestones', COALESCE(total_milestones, 0),
            'current_quarter', COALESCE(current_quarter, 1)
        ),
        'recent_activity', COALESCE(activity_array, '[]'::jsonb)
    ) INTO context
    FROM learning_paths lp
    LEFT JOIN (
        SELECT 
            learning_path_id,
            jsonb_agg(jsonb_build_object('name', skill_name, 'level', skill_level)) as skills_array
        FROM skill_assessments
        GROUP BY learning_path_id
    ) sa ON lp.id = sa.learning_path_id
    LEFT JOIN (
        SELECT 
            learning_path_id,
            jsonb_agg(goal_text) as goals_array
        FROM career_goals
        GROUP BY learning_path_id
    ) cg ON lp.id = cg.learning_path_id
    LEFT JOIN (
        SELECT 
            learning_path_id,
            jsonb_agg(notes) as activity_array
        FROM progress_tracking
        WHERE notes IS NOT NULL
        GROUP BY learning_path_id
    ) pt ON lp.id = pt.learning_path_id
    WHERE lp.user_id = user_uuid AND lp.status = 'active'
    ORDER BY lp.created_at DESC
    LIMIT 1;

    RETURN COALESCE(context, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track mentor session metrics
CREATE OR REPLACE FUNCTION track_mentor_session_metrics(user_uuid UUID, session_type VARCHAR(20))
RETURNS VOID AS $$
BEGIN
    INSERT INTO mentor_sessions (user_id, session_type, started_at)
    VALUES (user_uuid, session_type, NOW())
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE mentor_conversations IS 'Stores all conversations between users and the AI mentor';
COMMENT ON TABLE mentor_sessions IS 'Tracks mentor session metadata and analytics';
COMMENT ON TABLE mentor_feedback IS 'Stores user feedback on mentor responses for improvement';
COMMENT ON TABLE mentor_insights IS 'Stores AI-generated insights and recommendations';
COMMENT ON TABLE mentor_code_reviews IS 'Stores code review sessions and feedback';
COMMENT ON TABLE mentor_interview_sessions IS 'Stores interview preparation sessions';
COMMENT ON TABLE mentor_daily_checkins IS 'Stores daily motivation and check-in data';

COMMENT ON FUNCTION get_mentor_conversation_history IS 'Retrieves conversation history for a user';
COMMENT ON FUNCTION get_user_mentor_context IS 'Builds comprehensive user context for mentor AI';
COMMENT ON FUNCTION track_mentor_session_metrics IS 'Tracks mentor session analytics'; 
-- Database Setup Script for AI Helper Learning Path System
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning paths table
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS skill_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    skill_level VARCHAR(50) NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Career goals
CREATE TABLE IF NOT EXISTS career_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    goal_text TEXT NOT NULL,
    priority INTEGER DEFAULT 1,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Priority areas
CREATE TABLE IF NOT EXISTS priority_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    area_name VARCHAR(255) NOT NULL,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated learning plans
CREATE TABLE IF NOT EXISTS learning_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    estimated_hours INTEGER NOT NULL,
    plan_data JSONB NOT NULL, -- Stores the full generated plan structure
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plan quarters
CREATE TABLE IF NOT EXISTS plan_quarters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_plan_id UUID NOT NULL REFERENCES learning_plans(id) ON DELETE CASCADE,
    quarter_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    objectives JSONB NOT NULL, -- Array of objectives
    resources JSONB NOT NULL, -- Array of resources
    milestones JSONB NOT NULL, -- Array of milestones
    estimated_hours INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Progress tracking
CREATE TABLE IF NOT EXISTS progress_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    quarter_id UUID REFERENCES plan_quarters(id) ON DELETE SET NULL,
    milestone_id VARCHAR(255), -- Reference to milestone in quarter
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    notes TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_career_path ON learning_paths(career_path);
CREATE INDEX IF NOT EXISTS idx_skill_assessments_learning_path_id ON skill_assessments(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_career_goals_learning_path_id ON career_goals(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_priority_areas_learning_path_id ON priority_areas(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_learning_plans_learning_path_id ON learning_plans(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_plan_quarters_learning_plan_id ON plan_quarters(learning_plan_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_learning_path_id ON progress_tracking(learning_path_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_learning_paths_updated_at ON learning_paths;
CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_career_goals_updated_at ON career_goals;
CREATE TRIGGER update_career_goals_updated_at BEFORE UPDATE ON career_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_progress_tracking_updated_at ON progress_tracking;
CREATE TRIGGER update_progress_tracking_updated_at BEFORE UPDATE ON progress_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_quarters ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Sessions policies
DROP POLICY IF EXISTS "Users can manage own sessions" ON user_sessions;
CREATE POLICY "Users can manage own sessions" ON user_sessions FOR ALL USING (auth.uid() = user_id);

-- Learning paths policies
DROP POLICY IF EXISTS "Users can view own learning paths" ON learning_paths;
CREATE POLICY "Users can view own learning paths" ON learning_paths FOR SELECT USING (auth.uid() = user_id OR is_public = true);

DROP POLICY IF EXISTS "Users can create own learning paths" ON learning_paths;
CREATE POLICY "Users can create own learning paths" ON learning_paths FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own learning paths" ON learning_paths;
CREATE POLICY "Users can update own learning paths" ON learning_paths FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own learning paths" ON learning_paths;
CREATE POLICY "Users can delete own learning paths" ON learning_paths FOR DELETE USING (auth.uid() = user_id);

-- Related tables policies (cascade from learning_paths)
DROP POLICY IF EXISTS "Users can manage own skill assessments" ON skill_assessments;
CREATE POLICY "Users can manage own skill assessments" ON skill_assessments FOR ALL USING (
    EXISTS (SELECT 1 FROM learning_paths WHERE learning_paths.id = skill_assessments.learning_path_id AND learning_paths.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can manage own career goals" ON career_goals;
CREATE POLICY "Users can manage own career goals" ON career_goals FOR ALL USING (
    EXISTS (SELECT 1 FROM learning_paths WHERE learning_paths.id = career_goals.learning_path_id AND learning_paths.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can manage own priority areas" ON priority_areas;
CREATE POLICY "Users can manage own priority areas" ON priority_areas FOR ALL USING (
    EXISTS (SELECT 1 FROM learning_paths WHERE learning_paths.id = priority_areas.learning_path_id AND learning_paths.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can manage own learning plans" ON learning_plans;
CREATE POLICY "Users can manage own learning plans" ON learning_plans FOR ALL USING (
    EXISTS (SELECT 1 FROM learning_paths WHERE learning_paths.id = learning_plans.learning_path_id AND learning_paths.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can manage own plan quarters" ON plan_quarters;
CREATE POLICY "Users can manage own plan quarters" ON plan_quarters FOR ALL USING (
    EXISTS (SELECT 1 FROM learning_plans lp JOIN learning_paths lpath ON lp.learning_path_id = lpath.id WHERE lp.id = plan_quarters.learning_plan_id AND lpath.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can manage own progress tracking" ON progress_tracking;
CREATE POLICY "Users can manage own progress tracking" ON progress_tracking FOR ALL USING (
    EXISTS (SELECT 1 FROM learning_paths WHERE learning_paths.id = progress_tracking.learning_path_id AND learning_paths.user_id = auth.uid())
);

-- Success message
SELECT 'Database setup completed successfully!' as status; 
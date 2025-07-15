-- Learning Path System Database Schema
-- This schema supports the AI-powered learning path generation and tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends existing auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT,
    experience_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills assessment table
CREATE TABLE IF NOT EXISTS public.skills_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    skills TEXT[] NOT NULL,
    skill_levels JSONB NOT NULL, -- {"skill_name": "beginner|intermediate|advanced"}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User goals table
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    career_goals TEXT[] NOT NULL,
    timeline_months INTEGER NOT NULL,
    priority_areas TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning plans table
CREATE TABLE IF NOT EXISTS public.learning_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    plan_name TEXT NOT NULL,
    summary TEXT NOT NULL,
    total_estimated_hours INTEGER NOT NULL,
    timeline_months INTEGER NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning plan quarters table
CREATE TABLE IF NOT EXISTS public.learning_plan_quarters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plan_id UUID REFERENCES public.learning_plans(id) ON DELETE CASCADE NOT NULL,
    quarter_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    objectives TEXT[] NOT NULL,
    resources TEXT[] NOT NULL,
    milestones TEXT[] NOT NULL,
    estimated_hours INTEGER NOT NULL,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(plan_id, quarter_number)
);

-- Progress tracking table
CREATE TABLE IF NOT EXISTS public.progress_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.learning_plans(id) ON DELETE CASCADE NOT NULL,
    quarter_id UUID REFERENCES public.learning_plan_quarters(id) ON DELETE CASCADE NOT NULL,
    milestone_id TEXT NOT NULL, -- References milestone from quarters table
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    notes TEXT,
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz results table
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    quiz_type TEXT NOT NULL CHECK (quiz_type IN ('skills_assessment', 'progress_check')),
    questions JSONB NOT NULL,
    answers JSONB NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning resources table
CREATE TABLE IF NOT EXISTS public.learning_resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('course', 'book', 'article', 'video', 'project')),
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_hours INTEGER,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User resource completions table
CREATE TABLE IF NOT EXISTS public.user_resource_completions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    resource_id UUID REFERENCES public.learning_resources(id) ON DELETE CASCADE NOT NULL,
    completion_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    UNIQUE(user_id, resource_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_skills_assessments_user_id ON public.skills_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_plans_user_id ON public.learning_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_plan_quarters_plan_id ON public.learning_plan_quarters(plan_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_user_id ON public.progress_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_plan_id ON public.progress_tracking(plan_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resource_completions_user_id ON public.user_resource_completions(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skills_assessments_updated_at BEFORE UPDATE ON public.skills_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON public.user_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_plans_updated_at BEFORE UPDATE ON public.learning_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_plan_quarters_updated_at BEFORE UPDATE ON public.learning_plan_quarters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_tracking_updated_at BEFORE UPDATE ON public.progress_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_resources_updated_at BEFORE UPDATE ON public.learning_resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_plan_quarters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_resource_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for skills_assessments
CREATE POLICY "Users can view own skills assessments" ON public.skills_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own skills assessments" ON public.skills_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own skills assessments" ON public.skills_assessments FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_goals
CREATE POLICY "Users can view own goals" ON public.user_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.user_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.user_goals FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for learning_plans
CREATE POLICY "Users can view own learning plans" ON public.learning_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning plans" ON public.learning_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own learning plans" ON public.learning_plans FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for learning_plan_quarters
CREATE POLICY "Users can view own plan quarters" ON public.learning_plan_quarters FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.learning_plans WHERE id = plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own plan quarters" ON public.learning_plan_quarters FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.learning_plans WHERE id = plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own plan quarters" ON public.learning_plan_quarters FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.learning_plans WHERE id = plan_id AND user_id = auth.uid())
);

-- RLS Policies for progress_tracking
CREATE POLICY "Users can view own progress" ON public.progress_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.progress_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.progress_tracking FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for quiz_results
CREATE POLICY "Users can view own quiz results" ON public.quiz_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz results" ON public.quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_resource_completions
CREATE POLICY "Users can view own resource completions" ON public.user_resource_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resource completions" ON public.user_resource_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resource completions" ON public.user_resource_completions FOR UPDATE USING (auth.uid() = user_id);

-- Public read access for learning_resources
CREATE POLICY "Anyone can view learning resources" ON public.learning_resources FOR SELECT USING (true);

-- Insert some sample learning resources
INSERT INTO public.learning_resources (title, description, url, resource_type, difficulty_level, estimated_hours, tags) VALUES
('React Fundamentals', 'Learn the basics of React including components, props, and state', 'https://react.dev/learn', 'course', 'beginner', 20, ARRAY['react', 'javascript', 'frontend']),
('Advanced TypeScript', 'Master TypeScript advanced features and best practices', 'https://typescriptlang.org/docs/', 'course', 'intermediate', 30, ARRAY['typescript', 'javascript', 'programming']),
('AWS Solutions Architect', 'Comprehensive AWS cloud architecture course', 'https://aws.amazon.com/training/', 'course', 'intermediate', 40, ARRAY['aws', 'cloud', 'devops']),
('Clean Code by Robert Martin', 'Learn to write clean, maintainable code', 'https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350884', 'book', 'intermediate', 15, ARRAY['programming', 'best-practices', 'software-engineering']),
('System Design Interview', 'Prepare for system design interviews with practical examples', 'https://github.com/donnemartin/system-design-primer', 'article', 'advanced', 25, ARRAY['system-design', 'architecture', 'interview-prep']),
('Docker for Developers', 'Containerize your applications with Docker', 'https://docs.docker.com/get-started/', 'course', 'beginner', 10, ARRAY['docker', 'containers', 'devops']),
('Machine Learning Basics', 'Introduction to machine learning concepts and algorithms', 'https://www.coursera.org/learn/machine-learning', 'course', 'intermediate', 35, ARRAY['machine-learning', 'ai', 'data-science']),
('Leadership in Tech', 'Develop leadership skills for technical teams', 'https://www.manager-tools.com/', 'course', 'intermediate', 20, ARRAY['leadership', 'management', 'soft-skills']);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated; 
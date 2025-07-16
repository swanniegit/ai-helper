-- Fix Quiz Tables - Create all missing quiz-related tables

-- 1. Quiz Templates table
CREATE TABLE IF NOT EXISTS public.quiz_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    skill_category VARCHAR(100) NOT NULL,
    difficulty_level VARCHAR(50) NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    quiz_type VARCHAR(50) DEFAULT 'practice' CHECK (quiz_type IN ('practice', 'assessment', 'certification')),
    time_limit_minutes INTEGER DEFAULT 30,
    question_count INTEGER DEFAULT 15,
    passing_score INTEGER DEFAULT 70,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Quiz Questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.quiz_templates(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'code_completion')),
    options JSONB, -- For multiple choice questions
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    difficulty_level VARCHAR(50) NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    skill_tags TEXT[],
    points INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Quiz Sessions table
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.quiz_templates(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    questions JSONB NOT NULL, -- Array of question objects
    current_question_index INTEGER DEFAULT 0,
    answers JSONB DEFAULT '[]', -- Array of user answers
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Quiz Results table
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.quiz_templates(id) ON DELETE CASCADE,
    quiz_type VARCHAR(50) DEFAULT 'practice' CHECK (quiz_type IN ('practice', 'assessment', 'certification')),
    questions JSONB NOT NULL, -- Array of question objects
    user_answers JSONB NOT NULL, -- Array of user answers
    correct_answers JSONB NOT NULL, -- Array of correct answers
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage_score DECIMAL(5,2) NOT NULL,
    time_taken_seconds INTEGER,
    difficulty_level VARCHAR(50) NOT NULL,
    skill_category VARCHAR(100) NOT NULL,
    passed BOOLEAN NOT NULL,
    feedback JSONB, -- Feedback object
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User Quiz Preferences table
CREATE TABLE IF NOT EXISTS public.user_quiz_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    preferred_difficulty VARCHAR(50) DEFAULT 'intermediate' CHECK (preferred_difficulty IN ('beginner', 'intermediate', 'advanced')),
    preferred_question_count INTEGER DEFAULT 15,
    preferred_quiz_type VARCHAR(50) DEFAULT 'practice' CHECK (preferred_quiz_type IN ('practice', 'assessment', 'certification')),
    preferred_time_limit_minutes INTEGER DEFAULT 30,
    skill_interests TEXT[], -- Array of skill categories user is interested in
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Quiz Analytics table
CREATE TABLE IF NOT EXISTS public.quiz_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    quiz_result_id UUID REFERENCES public.quiz_results(id) ON DELETE CASCADE,
    skill_category VARCHAR(100) NOT NULL,
    difficulty_level VARCHAR(50) NOT NULL,
    performance_metric VARCHAR(100) NOT NULL, -- e.g., 'accuracy', 'speed', 'completion_rate'
    metric_value DECIMAL(10,4) NOT NULL,
    time_spent_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample quiz templates
INSERT INTO public.quiz_templates (name, description, skill_category, difficulty_level, quiz_type, time_limit_minutes, question_count) VALUES
('JavaScript Fundamentals', 'Basic JavaScript concepts and syntax', 'JavaScript', 'beginner', 'practice', 20, 10),
('JavaScript Intermediate', 'Advanced JavaScript concepts including ES6+ features', 'JavaScript', 'intermediate', 'practice', 30, 15),
('JavaScript Advanced', 'Complex JavaScript patterns and advanced concepts', 'JavaScript', 'advanced', 'practice', 45, 20),
('React Basics', 'Introduction to React components and hooks', 'React', 'beginner', 'practice', 25, 12),
('React Intermediate', 'State management and advanced React patterns', 'React', 'intermediate', 'practice', 35, 18),
('React Advanced', 'Advanced React patterns and performance optimization', 'React', 'advanced', 'practice', 50, 25),
('SQL Fundamentals', 'Basic SQL queries and database concepts', 'SQL', 'beginner', 'practice', 20, 10),
('SQL Intermediate', 'Advanced SQL queries and database design', 'SQL', 'intermediate', 'practice', 30, 15),
('SQL Advanced', 'Complex SQL operations and optimization', 'SQL', 'advanced', 'practice', 45, 20),
('Python Basics', 'Introduction to Python programming', 'Python', 'beginner', 'practice', 20, 10),
('Python Intermediate', 'Advanced Python concepts and libraries', 'Python', 'intermediate', 'practice', 30, 15),
('Python Advanced', 'Advanced Python patterns and optimization', 'Python', 'advanced', 'practice', 45, 20),
('PL/SQL Basics', 'Introduction to PL/SQL programming', 'PL/SQL', 'beginner', 'practice', 20, 10),
('PL/SQL Intermediate', 'Advanced PL/SQL concepts and procedures', 'PL/SQL', 'intermediate', 'practice', 30, 15),
('PL/SQL Advanced', 'Complex PL/SQL patterns and optimization', 'PL/SQL', 'advanced', 'practice', 45, 20)
ON CONFLICT DO NOTHING;

-- Insert sample questions for JavaScript beginner template
INSERT INTO public.quiz_questions (template_id, question_text, question_type, options, correct_answer, explanation, difficulty_level, skill_tags) 
SELECT 
    qt.id,
    'What is the correct way to declare a variable in JavaScript?',
    'multiple_choice',
    '["var x = 5;", "variable x = 5;", "v x = 5;", "declare x = 5;"]',
    'var x = 5;',
    'The "var" keyword is used to declare variables in JavaScript.',
    'beginner',
    ARRAY['JavaScript', 'variables', 'syntax']
FROM public.quiz_templates qt 
WHERE qt.name = 'JavaScript Fundamentals' AND qt.difficulty_level = 'beginner'
ON CONFLICT DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE public.quiz_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quiz_templates (read-only for all authenticated users)
CREATE POLICY "Allow read access to quiz templates" ON public.quiz_templates
    FOR SELECT USING (true);

-- Create RLS policies for quiz_questions (read-only for all authenticated users)
CREATE POLICY "Allow read access to quiz questions" ON public.quiz_questions
    FOR SELECT USING (true);

-- Create RLS policies for quiz_sessions (users can only access their own sessions)
CREATE POLICY "Users can manage their own quiz sessions" ON public.quiz_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for quiz_results (users can only access their own results)
CREATE POLICY "Users can manage their own quiz results" ON public.quiz_results
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for user_quiz_preferences (users can only access their own preferences)
CREATE POLICY "Users can manage their own quiz preferences" ON public.user_quiz_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for quiz_analytics (users can only access their own analytics)
CREATE POLICY "Users can manage their own quiz analytics" ON public.quiz_analytics
    FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_templates_skill_category ON public.quiz_templates(skill_category);
CREATE INDEX IF NOT EXISTS idx_quiz_templates_difficulty ON public.quiz_templates(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_template_id ON public.quiz_questions(template_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_token ON public.quiz_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_template_id ON public.quiz_results(template_id);
CREATE INDEX IF NOT EXISTS idx_quiz_analytics_user_id ON public.quiz_analytics(user_id); 
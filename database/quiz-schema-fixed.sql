-- Enhanced Quiz System Database Schema (Fixed)
-- This schema supports AI-powered quiz generation, adaptive difficulty, and detailed analytics
-- Fixed to reference the correct 'users' table instead of 'user_profiles'

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Quiz templates table (for different types of quizzes)
CREATE TABLE IF NOT EXISTS public.quiz_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    quiz_type TEXT NOT NULL CHECK (quiz_type IN ('skills_assessment', 'progress_check', 'practice', 'certification')),
    skill_category TEXT NOT NULL, -- e.g., 'PHP OOP', 'Oracle PL/SQL', 'Database Design'
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    question_count INTEGER NOT NULL DEFAULT 15,
    time_limit_minutes INTEGER DEFAULT 30,
    passing_score INTEGER DEFAULT 70,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question bank table (stores all available questions)
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID REFERENCES public.quiz_templates(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'code_snippet')),
    options JSONB, -- For multiple choice: ["option1", "option2", "option3", "option4"]
    correct_answer TEXT NOT NULL,
    explanation TEXT, -- Explanation of why the answer is correct
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    skill_tags TEXT[], -- Array of skills this question tests
    code_snippet TEXT, -- For code-related questions
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced quiz results table (FIXED: references users table)
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.quiz_templates(id) ON DELETE CASCADE NOT NULL,
    quiz_type TEXT NOT NULL CHECK (quiz_type IN ('skills_assessment', 'progress_check', 'practice', 'certification')),
    questions JSONB NOT NULL, -- Array of question objects
    user_answers JSONB NOT NULL, -- Array of user's answers
    correct_answers JSONB NOT NULL, -- Array of correct answers
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage_score NUMERIC(5,2) NOT NULL,
    time_taken_seconds INTEGER,
    difficulty_level TEXT NOT NULL,
    skill_category TEXT NOT NULL,
    passed BOOLEAN NOT NULL,
    feedback JSONB, -- Detailed feedback and recommendations
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz sessions table (for tracking active quiz sessions) (FIXED: references users table)
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.quiz_templates(id) ON DELETE CASCADE NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    questions JSONB NOT NULL, -- Questions for this session
    current_question_index INTEGER DEFAULT 0,
    answers JSONB DEFAULT '[]', -- User's answers so far
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '2 hours')
);

-- Quiz analytics table (for detailed performance tracking) (FIXED: references users table)
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

-- User quiz preferences table (FIXED: references users table)
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

-- Create indexes for better performance
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

-- Create triggers for updated_at columns
CREATE TRIGGER update_quiz_templates_updated_at BEFORE UPDATE ON public.quiz_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON public.quiz_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_quiz_preferences_updated_at BEFORE UPDATE ON public.user_quiz_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.quiz_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_templates (read-only for all authenticated users)
CREATE POLICY "Anyone can view active quiz templates" ON public.quiz_templates FOR SELECT USING (is_active = true);

-- RLS Policies for quiz_questions (read-only for all authenticated users)
CREATE POLICY "Anyone can view active quiz questions" ON public.quiz_questions FOR SELECT USING (is_active = true);

-- RLS Policies for quiz_results
CREATE POLICY "Users can view own quiz results" ON public.quiz_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz results" ON public.quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for quiz_sessions
CREATE POLICY "Users can view own quiz sessions" ON public.quiz_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz sessions" ON public.quiz_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quiz sessions" ON public.quiz_sessions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for quiz_analytics
CREATE POLICY "Users can view own quiz analytics" ON public.quiz_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz analytics" ON public.quiz_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_quiz_preferences
CREATE POLICY "Users can view own quiz preferences" ON public.user_quiz_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz preferences" ON public.user_quiz_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quiz preferences" ON public.user_quiz_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample quiz templates
INSERT INTO public.quiz_templates (name, description, quiz_type, skill_category, difficulty_level, question_count, time_limit_minutes, passing_score) VALUES
('PHP OOP Fundamentals', 'Test your knowledge of PHP Object-Oriented Programming basics', 'practice', 'PHP OOP', 'beginner', 15, 20, 70),
('PHP OOP Advanced', 'Advanced PHP OOP concepts including design patterns', 'practice', 'PHP OOP', 'intermediate', 15, 25, 75),
('PHP OOP Expert', 'Expert-level PHP OOP and architectural patterns', 'practice', 'PHP OOP', 'advanced', 15, 30, 80),
('Laravel Framework Basics', 'Laravel framework fundamentals and MVC pattern', 'practice', 'Laravel Framework', 'beginner', 15, 20, 70),
('Laravel Advanced Features', 'Advanced Laravel features and best practices', 'practice', 'Laravel Framework', 'intermediate', 15, 25, 75),
('Oracle SQL Fundamentals', 'Basic SQL queries and database operations', 'practice', 'Oracle SQL', 'beginner', 15, 20, 70),
('Oracle SQL Advanced', 'Advanced SQL queries and optimization', 'practice', 'Oracle SQL', 'intermediate', 15, 25, 75),
('PL/SQL Programming', 'PL/SQL programming fundamentals', 'practice', 'PL/SQL', 'beginner', 15, 20, 70),
('PL/SQL Advanced', 'Advanced PL/SQL features and optimization', 'practice', 'PL/SQL', 'intermediate', 15, 25, 75),
('Database Design', 'Database design principles and normalization', 'practice', 'Database Design', 'intermediate', 15, 25, 75);

-- Insert sample questions for PHP OOP (beginner)
INSERT INTO public.quiz_questions (template_id, question_text, question_type, options, correct_answer, explanation, difficulty_level, skill_tags) VALUES
((SELECT id FROM public.quiz_templates WHERE name = 'PHP OOP Fundamentals' LIMIT 1), 
 'What is the correct way to declare a class in PHP?', 
 'multiple_choice', 
 '["class MyClass {}", "class MyClass() {}", "class MyClass: {}", "function MyClass() {}"]', 
 'class MyClass {}', 
 'In PHP, classes are declared using the "class" keyword followed by the class name and curly braces.', 
 'beginner', 
 ARRAY['PHP OOP', 'class declaration']),

((SELECT id FROM public.quiz_templates WHERE name = 'PHP OOP Fundamentals' LIMIT 1), 
 'Which keyword is used to create an object from a class?', 
 'multiple_choice', 
 '["new", "create", "object", "instance"]', 
 'new', 
 'The "new" keyword is used to instantiate a class and create an object.', 
 'beginner', 
 ARRAY['PHP OOP', 'object instantiation']),

((SELECT id FROM public.quiz_templates WHERE name = 'PHP OOP Fundamentals' LIMIT 1), 
 'What is the default visibility of class properties in PHP?', 
 'multiple_choice', 
 '["public", "private", "protected", "internal"]', 
 'public', 
 'In PHP, class properties are public by default unless explicitly declared otherwise.', 
 'beginner', 
 ARRAY['PHP OOP', 'visibility']),

((SELECT id FROM public.quiz_templates WHERE name = 'PHP OOP Fundamentals' LIMIT 1), 
 'Which method is automatically called when an object is created?', 
 'multiple_choice', 
 '["__construct()", "__init()", "__create()", "__new()"]', 
 '__construct()', 
 'The __construct() method is the constructor that is automatically called when a new object is created.', 
 'beginner', 
 ARRAY['PHP OOP', 'constructor']),

((SELECT id FROM public.quiz_templates WHERE name = 'PHP OOP Fundamentals' LIMIT 1), 
 'What does OOP stand for?', 
 'multiple_choice', 
 '["Object-Oriented Programming", "Object-Oriented Process", "Object-Oriented Protocol", "Object-Oriented Practice"]', 
 'Object-Oriented Programming', 
 'OOP stands for Object-Oriented Programming, a programming paradigm based on objects.', 
 'beginner', 
 ARRAY['PHP OOP', 'concepts']);

-- Insert sample questions for Oracle SQL (beginner)
INSERT INTO public.quiz_questions (template_id, question_text, question_type, options, correct_answer, explanation, difficulty_level, skill_tags) VALUES
((SELECT id FROM public.quiz_templates WHERE name = 'Oracle SQL Fundamentals' LIMIT 1), 
 'Which SQL command is used to retrieve data from a database?', 
 'multiple_choice', 
 '["SELECT", "GET", "RETRIEVE", "FETCH"]', 
 'SELECT', 
 'The SELECT command is used to retrieve data from database tables.', 
 'beginner', 
 ARRAY['Oracle SQL', 'SELECT']),

((SELECT id FROM public.quiz_templates WHERE name = 'Oracle SQL Fundamentals' LIMIT 1), 
 'What is the correct syntax to select all columns from a table named "employees"?', 
 'multiple_choice', 
 '["SELECT * FROM employees", "SELECT all FROM employees", "SELECT columns FROM employees", "GET * FROM employees"]', 
 'SELECT * FROM employees', 
 'The asterisk (*) is used to select all columns from a table.', 
 'beginner', 
 ARRAY['Oracle SQL', 'SELECT']),

((SELECT id FROM public.quiz_templates WHERE name = 'Oracle SQL Fundamentals' LIMIT 1), 
 'Which clause is used to filter records in a SELECT statement?', 
 'multiple_choice', 
 '["WHERE", "FILTER", "HAVING", "CONDITION"]', 
 'WHERE', 
 'The WHERE clause is used to filter records based on specified conditions.', 
 'beginner', 
 ARRAY['Oracle SQL', 'WHERE']),

((SELECT id FROM public.quiz_templates WHERE name = 'Oracle SQL Fundamentals' LIMIT 1), 
 'What is the correct syntax to insert a new record into a table?', 
 'multiple_choice', 
 '["INSERT INTO table_name VALUES (value1, value2)", "ADD INTO table_name VALUES (value1, value2)", "CREATE INTO table_name VALUES (value1, value2)", "PUT INTO table_name VALUES (value1, value2)"]', 
 'INSERT INTO table_name VALUES (value1, value2)', 
 'The INSERT INTO statement is used to add new records to a table.', 
 'beginner', 
 ARRAY['Oracle SQL', 'INSERT']),

((SELECT id FROM public.quiz_templates WHERE name = 'Oracle SQL Fundamentals' LIMIT 1), 
 'What is the purpose of the ORDER BY clause?', 
 'multiple_choice', 
 '["To sort the results", "To filter the results", "To group the results", "To limit the results"]', 
 'To sort the results', 
 'The ORDER BY clause is used to sort the result set in ascending or descending order.', 
 'beginner', 
 ARRAY['Oracle SQL', 'ORDER BY']);

-- Insert sample questions for PL/SQL (beginner)
INSERT INTO public.quiz_questions (template_id, question_text, question_type, options, correct_answer, explanation, difficulty_level, skill_tags) VALUES
((SELECT id FROM public.quiz_templates WHERE name = 'PL/SQL Programming' LIMIT 1), 
 'What does PL/SQL stand for?', 
 'multiple_choice', 
 '["Procedural Language/Structured Query Language", "Programming Language/SQL", "Process Language/Structured Query", "Procedural Logic/SQL"]', 
 'Procedural Language/Structured Query Language', 
 'PL/SQL stands for Procedural Language/Structured Query Language, Oracle''s procedural extension to SQL.', 
 'beginner', 
 ARRAY['PL/SQL', 'concepts']),

((SELECT id FROM public.quiz_templates WHERE name = 'PL/SQL Programming' LIMIT 1), 
 'Which keyword is used to declare a variable in PL/SQL?', 
 'multiple_choice', 
 '["DECLARE", "VAR", "VARIABLE", "DEFINE"]', 
 'DECLARE', 
 'The DECLARE keyword is used to declare variables in PL/SQL blocks.', 
 'beginner', 
 ARRAY['PL/SQL', 'variables']),

((SELECT id FROM public.quiz_templates WHERE name = 'PL/SQL Programming' LIMIT 1), 
 'What is the correct syntax for a PL/SQL block?', 
 'multiple_choice', 
 '["BEGIN ... END;", "START ... FINISH;", "PROCEDURE ... END;", "FUNCTION ... END;"]', 
 'BEGIN ... END;', 
 'A PL/SQL block starts with BEGIN and ends with END;', 
 'beginner', 
 ARRAY['PL/SQL', 'block structure']),

((SELECT id FROM public.quiz_templates WHERE name = 'PL/SQL Programming' LIMIT 1), 
 'Which statement is used to handle exceptions in PL/SQL?', 
 'multiple_choice', 
 '["EXCEPTION", "ERROR", "CATCH", "HANDLE"]', 
 'EXCEPTION', 
 'The EXCEPTION section is used to handle errors and exceptions in PL/SQL.', 
 'beginner', 
 ARRAY['PL/SQL', 'exception handling']),

((SELECT id FROM public.quiz_templates WHERE name = 'PL/SQL Programming' LIMIT 1), 
 'What is a cursor in PL/SQL?', 
 'multiple_choice', 
 '["A pointer to a result set", "A variable", "A function", "A procedure"]', 
 'A pointer to a result set', 
 'A cursor is a pointer to a result set that allows you to process rows one at a time.', 
 'beginner', 
 ARRAY['PL/SQL', 'cursors']); 
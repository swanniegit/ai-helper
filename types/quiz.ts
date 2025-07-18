// Quiz System TypeScript Types

export type QuizType = 'skills_assessment' | 'progress_check' | 'practice' | 'certification';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'code_snippet';

// Quiz Template Types
export interface QuizTemplate {
  id: string;
  name: string;
  description: string;
  quiz_type: QuizType;
  skill_category: string;
  difficulty_level: DifficultyLevel;
  question_count: number;
  time_limit_minutes: number;
  passing_score: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Quiz Question Types
export interface QuizQuestion {
  id: string;
  template_id: string;
  question_text: string;
  question_type: QuestionType;
  options?: string[]; // For multiple choice questions
  correct_answer: string;
  explanation?: string;
  difficulty_level: DifficultyLevel;
  skill_tags: string[];
  code_snippet?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Quiz Session Types
export interface QuizSession {
  id: string;
  user_id: string;
  template_id: string;
  session_token: string;
  questions: QuizQuestion[];
  current_question_index: number;
  answers: string[];
  start_time: string;
  end_time?: string;
  is_active: boolean;
  expires_at: string;
  template?: QuizTemplate;
}

// Quiz Result Types
export interface QuizResult {
  id: string;
  user_id: string;
  template_id: string;
  quiz_type: QuizType;
  questions: QuizQuestion[];
  user_answers: string[];
  correct_answers: string[];
  score: number;
  total_questions: number;
  percentage_score: number;
  time_taken_seconds?: number;
  difficulty_level: DifficultyLevel;
  skill_category: string;
  passed: boolean;
  feedback?: QuizFeedback;
  taken_at: string;
}

// Quiz Feedback Types
export interface QuizFeedback {
  overall_performance: 'excellent' | 'good' | 'fair' | 'needs_improvement';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  next_steps: string[];
  skill_gaps: string[];
  estimated_improvement_time: string;
}

// Quiz Analytics Types
export interface QuizAnalytics {
  id: string;
  user_id: string;
  quiz_result_id: string;
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  time_spent_seconds?: number;
  difficulty_level: DifficultyLevel;
  skill_tag: string;
  created_at: string;
}

// User Quiz Preferences Types
export interface UserQuizPreferences {
  id: string;
  user_id: string;
  preferred_difficulty: DifficultyLevel;
  preferred_question_count: number;
  preferred_time_limit: number;
  notification_enabled: boolean;
  auto_retake_failed: boolean;
  created_at: string;
  updated_at: string;
}

// API Request/Response Types
export interface GenerateQuizRequest {
  skill_category: string;
  difficulty_level?: DifficultyLevel;
  question_count?: number;
  quiz_type?: QuizType;
}

export interface GenerateQuizResponse {
  session_token: string;
  template: QuizTemplate;
  questions: QuizQuestion[];
  time_limit_minutes: number;
  total_questions: number;
}

export interface SubmitQuizRequest {
  session_token: string;
  answers: string[];
  time_taken_seconds: number;
}

export interface SubmitQuizResponse {
  result: QuizResult;
  feedback: QuizFeedback;
  analytics: QuizAnalytics[];
}

export interface QuizProgress {
  completed_quizzes: number;
  average_score: number;
  total_time_spent: number;
  skills_mastered: string[];
  skills_needing_improvement: string[];
  weak_areas: string[];
  last_quiz_date: string;
  recent_performance: {
    date: string;
    score: number;
    quiz_name: string;
  }[];
}

// Quiz State Management Types
export interface QuizState {
  currentSession?: QuizSession;
  currentQuestion?: QuizQuestion;
  currentQuestionIndex: number;
  answers: string[];
  timeRemaining: number;
  isComplete: boolean;
  isLoading: boolean;
  error?: string;
}

// Quiz UI Component Props
export interface QuizQuestionProps {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  selectedAnswer?: string;
  timeRemaining: number;
}

export interface QuizResultsProps {
  result: QuizResult;
  feedback: QuizFeedback;
  onRetake: () => void;
  onContinue: () => void;
}

export interface QuizProgressProps {
  progress: QuizProgress;
  onViewDetails: (quizId: string) => void;
}

// Quiz Generation Types
export interface AIQuizGenerationRequest {
  skill_category: string;
  difficulty_level: DifficultyLevel;
  question_count: number;
  user_skill_level?: DifficultyLevel;
  previous_performance?: {
    average_score: number;
    weak_areas: string[];
  };
}

export interface AIQuizGenerationResponse {
  questions: QuizQuestion[];
  estimated_difficulty: DifficultyLevel;
  skill_coverage: string[];
  time_estimate: number;
}

// Quiz Statistics Types
export interface QuizStatistics {
  total_quizzes_taken: number;
  average_score: number;
  best_score: number;
  worst_score: number;
  total_time_spent: number;
  skills_progress: {
    skill: string;
    average_score: number;
    quizzes_taken: number;
    improvement_rate: number;
  }[];
  difficulty_progress: {
    level: DifficultyLevel;
    average_score: number;
    quizzes_taken: number;
  }[];
  recent_trends: {
    date: string;
    average_score: number;
    quizzes_taken: number;
  }[];
}

// Quiz Recommendation Types
export interface QuizRecommendation {
  template: QuizTemplate;
  reason: string;
  estimated_difficulty: DifficultyLevel;
  expected_improvement: string;
  prerequisites: string[];
}

// Quiz Export Types
export interface QuizExport {
  user_id: string;
  export_date: string;
  quiz_results: QuizResult[];
  statistics: QuizStatistics;
  progress_report: string;
} 
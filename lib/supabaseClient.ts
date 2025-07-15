import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types for learning path system
export interface SkillsAssessment {
  id: string
  user_id: string
  skills: string[]
  skill_levels: Record<string, 'beginner' | 'intermediate' | 'advanced'>
  created_at: string
  updated_at: string
}

export interface UserGoals {
  id: string
  user_id: string
  career_goals: string[]
  timeline_months: number
  priority_areas: string[]
  created_at: string
  updated_at: string
}

export interface LearningPlan {
  id: string
  user_id: string
  plan_name: string
  quarter: number // 1-4 for 3-month periods
  objectives: string[]
  resources: string[]
  milestones: string[]
  created_at: string
  updated_at: string
}

export interface QuizResult {
  id: string
  user_id: string
  quiz_type: 'skills_assessment' | 'progress_check'
  questions: any[]
  answers: any[]
  score: number
  total_questions: number
  taken_at: string
}

export interface ProgressTracking {
  id: string
  user_id: string
  plan_id: string
  milestone_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  notes: string
  due_date: string
  completed_at?: string
  created_at: string
  updated_at: string
}

// DevPath Chronicles Gamification Types
// Phase 1: Foundation RPG System

// XP System Types
export type DevLevel = 'Code Apprentice' | 'Bug Hunter' | 'Logic Architect' | 'Code Wizard' | 'Dev Sage';

export type XPAction = 
  | 'quiz_completed'
  | 'perfect_quiz_score'
  | 'learning_milestone'
  | 'mentor_chat_session'
  | 'daily_streak_maintained'
  | 'skill_mastered'
  | 'interview_prep_session'
  | 'motivation_session';

export interface UserXP {
  user_id: string;
  total_xp: number;
  current_level: DevLevel;
  level_progress: number; // 0-100 percentage to next level
  created_at: string;
  updated_at: string;
}

export interface XPAward {
  xp_amount: number;
  new_total_xp: number;
  level_up?: {
    old_level: DevLevel;
    new_level: DevLevel;
    level_up_bonus?: number;
  };
  achievements_unlocked?: Achievement[];
}

export interface XPTransaction {
  id: string;
  user_id: string;
  action: XPAction;
  xp_amount: number;
  source_id?: string;
  source_type?: string;
  metadata: Record<string, any>;
  created_at: string;
}

// Achievement System Types
export type BadgeCategory = 'mastery' | 'special' | 'social' | 'streak';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon_name: string; // Lucide icon name
  category: BadgeCategory;
  xp_reward: number;
  unlock_condition: Record<string, any>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  notification_sent: boolean;
  metadata: Record<string, any>;
  badge?: BadgeDefinition; // Populated via join
}

export interface UnlockCondition {
  quiz_count?: number;
  perfect_scores?: number;
  learning_milestones?: number;
  interview_prep_sessions?: number;
  motivation_sessions?: number;
  quiz_streak?: number;
  daily_streak?: number;
  mentor_chats?: number;
  late_night_quiz?: number;
  fast_quiz?: number;
  score_improvement?: number;
  interview_all_levels?: number;
}

// Streak System Types
export interface UserStreaks {
  user_id: string;
  quiz_streak: number;
  mentor_chat_streak: number;
  daily_activity_streak: number;
  longest_quiz_streak: number;
  longest_mentor_streak: number;
  longest_daily_streak: number;
  last_quiz_date?: string;
  last_mentor_date?: string;
  last_activity_date: string;
  updated_at: string;
}

export interface StreakUpdate {
  streak_type: 'quiz' | 'mentor_chat' | 'daily_activity';
  current_streak: number;
  longest_streak: number;
  is_new_record: boolean;
  streak_milestone_achieved?: number; // if reached a milestone like 7, 30, etc.
}

// Daily Challenge Types
export type ChallengeType = 
  | 'quick_learner'
  | 'mentor_session' 
  | 'interview_prep'
  | 'daily_motivation'
  | 'perfect_score'
  | 'streak_maintainer'
  | 'skill_explorer';

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';

export interface DailyChallenge {
  id: string;
  challenge_type: ChallengeType;
  title: string;
  description: string;
  xp_reward: number;
  badge_reward?: string; // badge_id
  target_value: number;
  is_active: boolean;
  difficulty_level: ChallengeDifficulty;
  created_at: string;
}

export interface UserDailyChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  current_progress: number;
  target_progress: number;
  completed_at?: string;
  assigned_date: string;
  expires_at: string;
  challenge?: DailyChallenge; // Populated via join
}

// Comprehensive User Progress Types
export interface UserGamificationData {
  xp: UserXP;
  achievements: Achievement[];
  streaks: UserStreaks;
  daily_challenges: UserDailyChallenge[];
  recent_transactions: XPTransaction[];
  next_level_requirements: {
    current_level: DevLevel;
    next_level: DevLevel | null;
    xp_needed: number;
    progress_percentage: number;
  };
  available_badges: BadgeDefinition[];
}

// Level Configuration
export interface LevelConfig {
  level: DevLevel;
  min_xp: number;
  max_xp: number | null;
  level_bonus: number;
  perks: string[];
}

// Component Props Types
export interface XPProgressBarProps {
  current_xp: number;
  current_level: DevLevel;
  level_progress: number;
  show_level_name?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface AchievementCardProps {
  achievement: Achievement;
  show_earned_date?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface BadgeDisplayProps {
  badge: BadgeDefinition;
  is_earned?: boolean;
  earned_date?: string;
  show_description?: boolean;
}

export interface DailyChallengeCardProps {
  challenge: UserDailyChallenge;
  onComplete?: (challengeId: string) => void;
  show_progress?: boolean;
}

export interface LevelUpModalProps {
  old_level: DevLevel;
  new_level: DevLevel;
  xp_gained: number;
  achievements_unlocked?: Achievement[];
  onClose: () => void;
  isOpen: boolean;
}

export interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

// API Response Types
export interface GamificationAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AwardXPRequest {
  action: XPAction;
  metadata?: Record<string, any>;
  source_id?: string;
  source_type?: string;
}

export interface AwardXPResponse extends GamificationAPIResponse<XPAward> {}

export interface GetUserProgressResponse extends GamificationAPIResponse<UserGamificationData> {}

export interface CheckAchievementsRequest {
  action: string;
  metadata?: Record<string, any>;
}

export interface CheckAchievementsResponse extends GamificationAPIResponse<Achievement[]> {}

// Utility Types
export interface XPActionConfig {
  action: XPAction;
  base_xp: number;
  description: string;
  multipliers?: {
    perfect_score?: number;
    streak_bonus?: number;
    difficulty_bonus?: Record<string, number>;
  };
}

export interface LevelThresholds {
  [key: string]: {
    min_xp: number;
    level: DevLevel;
    next_level?: DevLevel;
  };
}

// Constants for XP calculations
export const XP_ACTION_VALUES: Record<XPAction, number> = {
  quiz_completed: 50,
  perfect_quiz_score: 100,
  learning_milestone: 75,
  mentor_chat_session: 25,
  daily_streak_maintained: 30,
  skill_mastered: 200,
  interview_prep_session: 35,
  motivation_session: 20
};

export const LEVEL_THRESHOLDS: LevelThresholds = {
  'Code Apprentice': { min_xp: 0, level: 'Code Apprentice', next_level: 'Bug Hunter' },
  'Bug Hunter': { min_xp: 500, level: 'Bug Hunter', next_level: 'Logic Architect' },
  'Logic Architect': { min_xp: 1500, level: 'Logic Architect', next_level: 'Code Wizard' },
  'Code Wizard': { min_xp: 3000, level: 'Code Wizard', next_level: 'Dev Sage' },
  'Dev Sage': { min_xp: 5000, level: 'Dev Sage' }
};
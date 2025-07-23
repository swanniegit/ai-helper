// DevPath Chronicles Gamification Types
// Phase 1: Foundation RPG System
// Phase 2: Social Competition Layer
// Phase 3: Advanced Engagement Features

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

// Social Competition Types

// Leaderboard System Types
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time';
export type SkillCategory = 'PHP' | 'Oracle' | 'General' | 'Database' | 'Web Development';

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  skill_category: SkillCategory;
  time_period: LeaderboardPeriod;
  period_start: string;
  period_end: string;
  user_rank: number;
  user_score: number;
  anonymous_name: string;
  xp_earned: number;
  quizzes_completed: number;
  perfect_scores: number;
  streak_days: number;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardData {
  skill_category: SkillCategory;
  time_period: LeaderboardPeriod;
  entries: LeaderboardEntry[];
  total_participants: number;
  user_rank?: number;
  user_entry?: LeaderboardEntry;
  period_start: string;
  period_end: string;
}

// Guild System Types
export type GuildSkillFocus = 'php' | 'oracle' | 'general' | 'full_stack';
export type GuildType = 'study_squad' | 'skill_guild' | 'mentor_circle';
export type GuildRole = 'member' | 'moderator' | 'leader' | 'founder';

export interface Guild {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  skill_focus: GuildSkillFocus;
  guild_type: GuildType;
  max_members: number;
  current_members: number;
  is_public: boolean;
  join_code?: string;
  guild_level: number;
  total_guild_xp: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GuildMembership {
  id: string;
  guild_id: string;
  user_id: string;
  role: GuildRole;
  joined_at: string;
  contribution_xp: number;
  last_active_at: string;
  is_active: boolean;
  guild?: Guild; // Populated via join
}

export interface GuildChallenge {
  id: string;
  guild_id: string;
  challenge_title: string;
  challenge_description: string;
  challenge_type: string;
  target_metric: string;
  target_value: number;
  start_date: string;
  end_date: string;
  reward_xp: number;
  reward_badge_id?: string;
  current_progress: number;
  participants: number;
  is_completed: boolean;
  created_by: string;
  created_at: string;
}

// Enhanced Daily Challenge Types
export type EnhancedChallengeType = 
  | 'quick_learner'
  | 'mentor_session' 
  | 'interview_prep'
  | 'daily_motivation'
  | 'perfect_score'
  | 'streak_maintainer'
  | 'skill_explorer'
  | 'guild_contributor'
  | 'social_learner'
  | 'consistency_champion';

export interface ChallengeTemplate {
  id: string;
  challenge_type: EnhancedChallengeType;
  title: string;
  description: string;
  xp_reward: number;
  badge_reward?: string;
  target_value: number;
  difficulty_level: ChallengeDifficulty;
  skill_category?: SkillCategory;
  is_social: boolean;
  frequency: 'daily' | 'weekly' | 'special';
  is_active: boolean;
  created_at: string;
}

export interface EnhancedUserDailyChallenge {
  id: string;
  user_id: string;
  template_id: string;
  current_progress: number;
  target_progress: number;
  completed_at?: string;
  assigned_date: string;
  expires_at: string;
  guild_challenge: boolean;
  guild_id?: string;
  bonus_xp: number;
  template?: ChallengeTemplate; // Populated via join
  guild?: Guild; // Populated via join if guild_challenge
}

// Social Interaction Types
export type SocialInteractionType = 
  | 'guild_join'
  | 'guild_leave'
  | 'challenge_complete'
  | 'help_request'
  | 'encouragement'
  | 'achievement_celebrate'
  | 'study_buddy_request';

export interface SocialInteraction {
  id: string;
  from_user_id: string;
  to_user_id?: string;
  interaction_type: SocialInteractionType;
  guild_id?: string;
  metadata: Record<string, any>;
  created_at: string;
}

// Anonymous Name System
export interface AnonymousName {
  id: string;
  user_id: string;
  skill_category: string;
  anonymous_name: string;
  name_seed: number;
  created_at: string;
}

// Enhanced User Progress with Social Data
export interface SocialUserGamificationData extends UserGamificationData {
  guild_memberships: GuildMembership[];
  leaderboard_rankings: {
    [key in SkillCategory]?: {
      [key in LeaderboardPeriod]?: LeaderboardEntry;
    };
  };
  social_challenges: EnhancedUserDailyChallenge[];
  guild_challenges: GuildChallenge[];
  anonymous_names: AnonymousName[];
  social_stats: {
    guild_contribution_xp: number;
    challenges_helped_complete: number;
    social_interactions_count: number;
    guild_rank?: number;
  };
}

// Component Props for Social Features
export interface LeaderboardDisplayProps {
  skill_category: SkillCategory;
  time_period: LeaderboardPeriod;
  show_user_rank?: boolean;
  compact?: boolean;
}

export interface GuildCardProps {
  guild: Guild;
  user_membership?: GuildMembership;
  show_join_button?: boolean;
  onJoin?: (guildId: string) => void;
  onLeave?: (guildId: string) => void;
}

export interface DailyChallengeCardProps {
  challenge: EnhancedUserDailyChallenge;
  onComplete?: (challengeId: string) => void;
  show_progress?: boolean;
  show_guild_info?: boolean;
}

export interface GuildChallengeCardProps {
  challenge: GuildChallenge;
  guild: Guild;
  user_contribution?: number;
  show_progress?: boolean;
}

// API Response Types for Social Features
export interface LeaderboardAPIResponse extends GamificationAPIResponse<LeaderboardData> {}

export interface GuildListAPIResponse extends GamificationAPIResponse<{
  guilds: Guild[];
  user_memberships: GuildMembership[];
  recommended_guilds: Guild[];
}> {}

export interface JoinGuildRequest {
  guild_id: string;
  join_code?: string;
}

export interface CreateGuildRequest {
  name: string;
  display_name: string;
  description?: string;
  skill_focus: GuildSkillFocus;
  guild_type: GuildType;
  max_members?: number;
  is_public?: boolean;
}

export interface GuildChallengeRequest {
  challenge_title: string;
  challenge_description: string;
  challenge_type: string;
  target_metric: string;
  target_value: number;
  duration_days: number;
  reward_xp?: number;
}

// =============================================
// PHASE 3: ADVANCED ENGAGEMENT FEATURES
// =============================================

// Skill Tree System Types
export type SkillTreePath = 'php' | 'oracle' | 'general' | 'full_stack';
export type SkillNodeType = 'skill' | 'milestone' | 'specialization' | 'mastery';
export type SkillNodeStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'mastered';

export interface SkillTreeNode {
  id: string;
  node_key: string;
  title: string;
  description: string;
  skill_category: SkillCategory;
  node_level: number; // 1-4 (beginner to expert)
  
  // Tree positioning
  tree_path: SkillTreePath;
  position_x: number;
  position_y: number;
  tier: number; // 1-5 tier/row in skill tree
  
  // Requirements and rewards
  required_xp: number;
  required_level: number;
  xp_reward: number;
  unlock_badge_id?: string;
  
  // Visual representation
  icon_name: string;
  icon_color: string;
  node_type: SkillNodeType;
  
  // Metadata
  is_core_skill: boolean;
  estimated_hours: number;
  difficulty_rating: number; // 1-5
  
  created_at: string;
  updated_at: string;
}

export interface SkillTreePrerequisite {
  id: string;
  skill_node_id: string;
  prerequisite_node_id: string;
  is_required: boolean;
  created_at: string;
}

export interface UserSkillProgress {
  id: string;
  user_id: string;
  skill_node_id: string;
  
  // Progress tracking
  status: SkillNodeStatus;
  progress_percentage: number; // 0-100
  xp_earned: number;
  
  // Engagement tracking
  time_spent_minutes: number;
  quiz_attempts: number;
  mentor_sessions: number;
  learning_resources_accessed: number;
  
  // Completion tracking
  started_at?: string;
  completed_at?: string;
  mastered_at?: string;
  
  // Learning path integration
  learning_plan_id?: string;
  
  created_at: string;
  updated_at: string;
}

export interface UserSkillPath {
  id: string;
  user_id: string;
  path_name: SkillTreePath;
  is_primary: boolean;
  chosen_at: string;
  progress_percentage: number;
  
  // Path completion rewards
  path_xp_bonus: number;
  path_badge_earned?: string;
  
  created_at: string;
}

// Enhanced skill node with prerequisites and user progress
export interface EnhancedSkillTreeNode extends SkillTreeNode {
  prerequisites: Array<{
    id: string;
    title: string;
    node_key: string;
    is_required: boolean;
  }>;
  user_progress?: UserSkillProgress;
  is_unlocked: boolean;
  unlock_reason?: string; // Why this node is locked/unlocked
}

// Skill tree visualization data
export interface SkillTreeVisualization {
  tree_path: SkillTreePath;
  nodes: EnhancedSkillTreeNode[];
  connections: Array<{
    from_node_id: string;
    to_node_id: string;
    is_required: boolean;
  }>;
  user_stats: {
    total_nodes: number;
    completed_nodes: number;
    mastered_nodes: number;
    total_xp_earned: number;
    completion_percentage: number;
  };
}

// Skill Tree Achievement Types
export type SkillTreeAchievementType = 
  | 'tier_completion'
  | 'path_mastery'
  | 'speed_learner'
  | 'completionist'
  | 'explorer';

export interface SkillTreeAchievement {
  id: string;
  achievement_key: string;
  title: string;
  description: string;
  achievement_type: SkillTreeAchievementType;
  
  // Requirements
  required_skills_count?: number;
  required_tier?: number;
  required_path?: SkillTreePath;
  time_limit_hours?: number;
  
  // Rewards
  xp_reward: number;
  badge_id?: string;
  special_title?: string;
  
  // Visual
  icon_name: string;
  icon_color: string;
  rarity: BadgeRarity;
  
  created_at: string;
}

export interface UserSkillTreeAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  progress_snapshot: Record<string, any>;
}

// Seasonal Events System Types
export type SeasonalEventType = 'skill_focus' | 'xp_boost' | 'challenge_series' | 'community_goal';

export interface SeasonalEvent {
  id: string;
  event_key: string;
  title: string;
  description: string;
  event_type: SeasonalEventType;
  
  // Event timing
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  
  // Event parameters
  xp_multiplier: number; // 1.0 = normal, 1.5 = 50% bonus
  focus_skill_category?: SkillCategory;
  special_rewards: Array<{
    type: 'badge' | 'xp' | 'title';
    value: string | number;
    requirement: string;
  }>;
  
  // Community goals
  community_target?: number;
  community_progress: number;
  
  // Visual theming
  theme_color: string;
  banner_image?: string;
  icon_name: string;
  
  created_at: string;
}

export interface UserSeasonalProgress {
  id: string;
  user_id: string;
  event_id: string;
  
  // Progress tracking
  participation_score: number;
  xp_earned_during_event: number;
  challenges_completed: number;
  special_rewards_earned: Array<{
    type: string;
    value: string | number;
    earned_at: string;
  }>;
  
  // Engagement
  first_participation: string;
  last_activity: string;
}

// Quest Narrative System Types
export type QuestType = 'main_story' | 'side_quest' | 'daily_quest' | 'guild_quest';
export type QuestStatus = 'locked' | 'available' | 'active' | 'completed' | 'failed';

export interface Quest {
  id: string;
  quest_key: string;
  title: string;
  description: string;
  narrative_text: string; // Story/lore text
  quest_type: QuestType;
  
  // Requirements
  required_level: number;
  required_skills: string[]; // Array of skill node keys
  prerequisite_quests: string[]; // Array of quest keys
  
  // Objectives
  objectives: Array<{
    id: string;
    description: string;
    target_type: 'skill_complete' | 'xp_earn' | 'quiz_score' | 'mentor_sessions';
    target_value: number;
    current_progress: number;
    is_completed: boolean;
  }>;
  
  // Rewards
  xp_reward: number;
  skill_xp_bonus?: Record<string, number>; // Bonus XP for specific skills
  badge_reward?: string;
  unlock_quests?: string[]; // Quests unlocked upon completion
  
  // Story integration
  character_dialogue?: Array<{
    character: string;
    message: string;
    emotion: 'happy' | 'encouraging' | 'serious' | 'proud';
  }>;
  
  // Visual
  quest_giver_name: string;
  quest_giver_avatar: string;
  background_image?: string;
  
  // Metadata
  estimated_duration_hours: number;
  difficulty_rating: number;
  is_repeatable: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface UserQuest {
  id: string;
  user_id: string;
  quest_id: string;
  status: QuestStatus;
  
  // Progress tracking
  objectives_progress: Array<{
    objective_id: string;
    current_progress: number;
    completed_at?: string;
  }>;
  
  // Timeline
  started_at?: string;
  completed_at?: string;
  failed_at?: string;
  expires_at?: string;
  
  created_at: string;
  updated_at: string;
}

// Avatar/Character System Types
export type AvatarType = 'developer' | 'architect' | 'specialist' | 'mentor';
export type AvatarCustomization = {
  avatar_type: AvatarType;
  skin_tone: string;
  hair_style: string;
  hair_color: string;
  clothing_style: string;
  clothing_color: string;
  accessories: string[];
  background_theme: string;
};

export interface UserAvatar {
  id: string;
  user_id: string;
  avatar_name: string;
  avatar_title?: string; // Special titles earned through achievements
  
  // Customization
  customization: AvatarCustomization;
  
  // Progression
  avatar_level: number;
  avatar_xp: number;
  unlocked_items: string[]; // Cosmetic items unlocked through progression
  
  // Display preferences
  is_active: boolean;
  show_in_leaderboard: boolean;
  show_achievements: boolean;
  
  created_at: string;
  updated_at: string;
}

// Component Props for Phase 3 Features
export interface SkillTreeViewerProps {
  tree_path: SkillTreePath;
  interactive?: boolean;
  show_user_progress?: boolean;
  compact?: boolean;
  on_skill_select?: (skill: EnhancedSkillTreeNode) => void;
}

export interface SkillNodeCardProps {
  skill_node: EnhancedSkillTreeNode;
  show_details?: boolean;
  interactive?: boolean;
  on_start_learning?: (nodeId: string) => void;
  on_view_details?: (nodeId: string) => void;
}

export interface SeasonalEventBannerProps {
  event: SeasonalEvent;
  user_progress?: UserSeasonalProgress;
  compact?: boolean;
  show_participation?: boolean;
}

export interface QuestLogProps {
  quests: UserQuest[];
  show_completed?: boolean;
  filter_type?: QuestType | 'all';
  on_quest_select?: (quest: UserQuest) => void;
}

export interface AvatarDisplayProps {
  avatar: UserAvatar;
  size?: 'small' | 'medium' | 'large';
  show_level?: boolean;
  show_title?: boolean;
  interactive?: boolean;
  on_customize?: () => void;
}

// API Response Types for Phase 3
export interface SkillTreeAPIResponse extends GamificationAPIResponse<SkillTreeVisualization> {}

export interface UserSkillProgressAPIResponse extends GamificationAPIResponse<{
  progress: UserSkillProgress[];
  achievements: SkillTreeAchievement[];
  active_paths: UserSkillPath[];
}> {}

export interface SeasonalEventsAPIResponse extends GamificationAPIResponse<{
  active_events: SeasonalEvent[];
  user_progress: UserSeasonalProgress[];
  community_standings: Record<string, number>;
}> {}

export interface QuestSystemAPIResponse extends GamificationAPIResponse<{
  available_quests: Quest[];
  active_quests: UserQuest[];
  completed_quests: UserQuest[];
  quest_achievements: Achievement[];
}> {}

// Requests for Phase 3 APIs
export interface StartSkillLearningRequest {
  skill_node_id: string;
  learning_plan_id?: string;
}

export interface UpdateSkillProgressRequest {
  skill_node_id: string;
  progress_increment: number;
  activity_type: 'quiz' | 'mentor_session' | 'resource_access';
  metadata?: Record<string, any>;
}

export interface ChooseSkillPathRequest {
  path_name: SkillTreePath;
  is_primary: boolean;
}

export interface StartQuestRequest {
  quest_id: string;
}

export interface UpdateQuestProgressRequest {
  user_quest_id: string;
  objective_id: string;
  progress_value: number;
}

export interface CustomizeAvatarRequest {
  customization: Partial<AvatarCustomization>;
  avatar_name?: string;
}
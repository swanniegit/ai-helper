// DevPath Chronicles Gamification Service
// Phase 1: Foundation RPG System

import { supabase } from '../supabaseClient';
import {
  UserXP,
  XPAward,
  XPAction,
  XPTransaction,
  Achievement,
  BadgeDefinition,
  UserStreaks,
  StreakUpdate,
  UserDailyChallenge,
  UserGamificationData,
  DevLevel,
  UnlockCondition,
  XP_ACTION_VALUES,
  LEVEL_THRESHOLDS,
  AwardXPRequest
} from '../../types/gamification';

export class GamificationService {
  /**
   * Initialize user gamification data when they first join
   */
  static async initializeUser(userId: string): Promise<void> {
    try {
      // Create user XP record
      const { error: xpError } = await supabase
        .from('user_xp')
        .insert({
          user_id: userId,
          total_xp: 0,
          current_level: 'Code Apprentice' as DevLevel,
          level_progress: 0
        });

      if (xpError && xpError.code !== '23505') { // Ignore duplicate key error
        throw xpError;
      }

      // Create user streaks record
      const { error: streakError } = await supabase
        .from('user_streaks')
        .insert({
          user_id: userId,
          quiz_streak: 0,
          mentor_chat_streak: 0,
          daily_activity_streak: 0,
          longest_quiz_streak: 0,
          longest_mentor_streak: 0,
          longest_daily_streak: 0,
          last_activity_date: new Date().toISOString().split('T')[0]
        });

      if (streakError && streakError.code !== '23505') { // Ignore duplicate key error
        throw streakError;
      }

      console.log(`Gamification initialized for user: ${userId}`);
    } catch (error) {
      console.error('Initialize user gamification error:', error);
      throw error;
    }
  }

  /**
   * Award XP to user and handle level ups
   */
  static async awardXP(userId: string, request: AwardXPRequest): Promise<XPAward> {
    try {
      // Ensure user is initialized
      await this.initializeUser(userId);

      const { action, metadata = {}, source_id, source_type } = request;
      const baseXP = XP_ACTION_VALUES[action];
      
      if (!baseXP) {
        throw new Error(`Invalid XP action: ${action}`);
      }

      // Calculate bonus XP based on metadata
      let totalXP = baseXP;
      
      // Perfect score bonus
      if (metadata.is_perfect_score) {
        totalXP += XP_ACTION_VALUES.perfect_quiz_score;
      }

      // Streak bonus (10% per streak day up to 50%)
      if (metadata.streak_count && metadata.streak_count > 1) {
        const streakBonus = Math.min(metadata.streak_count * 0.1, 0.5);
        totalXP = Math.floor(totalXP * (1 + streakBonus));
      }

      // Difficulty bonus for quizzes
      if (metadata.difficulty_level) {
        const difficultyMultipliers = { easy: 1, medium: 1.2, hard: 1.5 };
        const multiplier = difficultyMultipliers[metadata.difficulty_level as keyof typeof difficultyMultipliers] || 1;
        totalXP = Math.floor(totalXP * multiplier);
      }

      // Get current user XP
      const { data: currentXP, error: xpError } = await supabase
        .from('user_xp')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (xpError) {
        throw xpError;
      }

      const newTotalXP = currentXP.total_xp + totalXP;
      const levelInfo = this.calculateLevel(newTotalXP);
      const levelUpInfo = currentXP.current_level !== levelInfo.level ? {
        old_level: currentXP.current_level as DevLevel,
        new_level: levelInfo.level,
        level_up_bonus: 50 // Bonus XP for leveling up
      } : undefined;

      // If level up, add bonus XP
      const finalTotalXP = levelUpInfo ? newTotalXP + (levelUpInfo.level_up_bonus || 0) : newTotalXP;
      const finalLevelInfo = this.calculateLevel(finalTotalXP);

      // Update user XP
      const { error: updateError } = await supabase
        .from('user_xp')
        .update({
          total_xp: finalTotalXP,
          current_level: finalLevelInfo.level,
          level_progress: finalLevelInfo.progress
        })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      // Log XP transaction
      const { error: transactionError } = await supabase
        .from('xp_transactions')
        .insert({
          user_id: userId,
          action,
          xp_amount: totalXP + (levelUpInfo?.level_up_bonus || 0),
          source_id,
          source_type,
          metadata: {
            ...metadata,
            base_xp: baseXP,
            bonus_xp: totalXP - baseXP,
            level_up_bonus: levelUpInfo?.level_up_bonus || 0
          }
        });

      if (transactionError) {
        console.error('XP transaction log error:', transactionError);
      }

      // Check for achievements
      const achievements = await this.checkAchievements(userId, action, metadata);

      const result: XPAward = {
        xp_amount: totalXP + (levelUpInfo?.level_up_bonus || 0),
        new_total_xp: finalTotalXP,
        level_up: levelUpInfo,
        achievements_unlocked: achievements
      };

      console.log(`Awarded ${result.xp_amount} XP to user ${userId} for ${action}`);
      return result;

    } catch (error) {
      console.error('Award XP error:', error);
      throw error;
    }
  }

  /**
   * Calculate user level and progress based on total XP
   */
  static calculateLevel(totalXP: number): { level: DevLevel; progress: number } {
    const levels = Object.entries(LEVEL_THRESHOLDS).sort((a, b) => b[1].min_xp - a[1].min_xp);
    
    for (const [levelName, config] of levels) {
      if (totalXP >= config.min_xp) {
        const currentLevel = config.level;
        const nextLevelConfig = levels.find(([, c]) => c.min_xp > config.min_xp);
        
        if (!nextLevelConfig) {
          // Max level reached
          return { level: currentLevel, progress: 100 };
        }

        const nextLevelXP = nextLevelConfig[1].min_xp;
        const xpInCurrentLevel = totalXP - config.min_xp;
        const xpNeededForNextLevel = nextLevelXP - config.min_xp;
        const progress = Math.min((xpInCurrentLevel / xpNeededForNextLevel) * 100, 100);

        return { level: currentLevel, progress };
      }
    }

    return { level: 'Code Apprentice', progress: 0 };
  }

  /**
   * Check and award achievements based on user actions
   */
  static async checkAchievements(userId: string, action: string, metadata: Record<string, any> = {}): Promise<Achievement[]> {
    try {
      // Get all active badge definitions
      const { data: badges, error: badgeError } = await supabase
        .from('badge_definitions')
        .select('*')
        .eq('is_active', true);

      if (badgeError) {
        throw badgeError;
      }

      // Get user&apos;s current achievements
      const { data: userAchievements, error: achievementError } = await supabase
        .from('user_achievements')
        .select('badge_id')
        .eq('user_id', userId);

      if (achievementError) {
        throw achievementError;
      }

      const earnedBadgeIds = new Set(userAchievements.map(a => a.badge_id));
      const newAchievements: Achievement[] = [];

      // Get user statistics for achievement checking
      const userStats = await this.getUserStatistics(userId);

      for (const badge of badges) {
        if (earnedBadgeIds.has(badge.id)) {
          continue; // Already earned
        }

        const condition = badge.unlock_condition as UnlockCondition;
        const isUnlocked = await this.checkUnlockCondition(condition, userStats, action, metadata);

        if (isUnlocked) {
          // Award the achievement
          const { data: newAchievement, error: insertError } = await supabase
            .from('user_achievements')
            .insert({
              user_id: userId,
              badge_id: badge.id,
              metadata: {
                triggered_by: action,
                context: metadata
              }
            })
            .select('*, badge:badge_definitions(*)')
            .single();

          if (insertError && insertError.code !== '23505') { // Ignore duplicate key error
            console.error('Achievement insert error:', insertError);
            continue;
          }

          if (newAchievement) {
            newAchievements.push(newAchievement);

            // Award badge XP if any
            if (badge.xp_reward > 0) {
              await this.awardXP(userId, {
                action: 'skill_mastered', // Use generic action for badge rewards
                metadata: {
                  badge_name: badge.name,
                  badge_xp: badge.xp_reward
                },
                source_id: badge.id,
                source_type: 'achievement'
              });
            }
          }
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Check achievements error:', error);
      return [];
    }
  }

  /**
   * Check if unlock condition is met
   */
  static async checkUnlockCondition(
    condition: UnlockCondition, 
    userStats: any, 
    currentAction: string, 
    currentMetadata: Record<string, any>
  ): Promise<boolean> {
    // Quiz count achievements
    if (condition.quiz_count && userStats.quiz_count >= condition.quiz_count) {
      return true;
    }

    // Perfect score achievements
    if (condition.perfect_scores && userStats.perfect_scores >= condition.perfect_scores) {
      return true;
    }

    // Learning milestones
    if (condition.learning_milestones && userStats.learning_milestones >= condition.learning_milestones) {
      return true;
    }

    // Interview prep sessions
    if (condition.interview_prep_sessions && userStats.interview_prep_sessions >= condition.interview_prep_sessions) {
      return true;
    }

    // Motivation sessions
    if (condition.motivation_sessions && userStats.motivation_sessions >= condition.motivation_sessions) {
      return true;
    }

    // Streak achievements
    if (condition.quiz_streak && userStats.quiz_streak >= condition.quiz_streak) {
      return true;
    }

    if (condition.daily_streak && userStats.daily_activity_streak >= condition.daily_streak) {
      return true;
    }

    // Mentor chat count
    if (condition.mentor_chats && userStats.mentor_chats >= condition.mentor_chats) {
      return true;
    }

    // Special conditions based on current action
    if (condition.late_night_quiz && currentAction === 'quiz_completed') {
      const now = new Date();
      const hour = now.getHours();
      return hour >= 22 || hour <= 6; // 10PM to 6AM
    }

    if (condition.fast_quiz && currentAction === 'quiz_completed' && currentMetadata.completion_time) {
      return currentMetadata.completion_time < 300; // Less than 5 minutes (300 seconds)
    }

    if (condition.score_improvement && currentAction === 'quiz_completed' && currentMetadata.score_improvement) {
      return currentMetadata.score_improvement >= condition.score_improvement;
    }

    return false;
  }

  /**
   * Get user statistics for achievement checking
   */
  static async getUserStatistics(userId: string): Promise<any> {
    try {
      // Get quiz statistics
      const { data: quizStats } = await supabase
        .from('quiz_results')
        .select('score')
        .eq('user_id', userId);

      const quiz_count = quizStats?.length || 0;
      const perfect_scores = quizStats?.filter(q => q.score >= 100).length || 0;

      // Get learning milestones (from learning plans progress)
      const { data: milestoneStats } = await supabase
        .from('progress_tracking')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed');

      const learning_milestones = milestoneStats?.length || 0;

      // Get mentor chat statistics
      const { data: mentorStats } = await supabase
        .from('xp_transactions')
        .select('action')
        .eq('user_id', userId)
        .in('action', ['mentor_chat_session', 'interview_prep_session', 'motivation_session']);

      const mentor_chats = mentorStats?.filter(t => t.action === 'mentor_chat_session').length || 0;
      const interview_prep_sessions = mentorStats?.filter(t => t.action === 'interview_prep_session').length || 0;
      const motivation_sessions = mentorStats?.filter(t => t.action === 'motivation_session').length || 0;

      // Get streak information
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      return {
        quiz_count,
        perfect_scores,
        learning_milestones,
        mentor_chats,
        interview_prep_sessions,
        motivation_sessions,
        quiz_streak: streakData?.quiz_streak || 0,
        daily_activity_streak: streakData?.daily_activity_streak || 0,
        ...streakData
      };
    } catch (error) {
      console.error('Get user statistics error:', error);
      return {};
    }
  }

  /**
   * Update user streaks
   */
  static async updateStreak(userId: string, streakType: 'quiz' | 'mentor_chat' | 'daily_activity'): Promise<StreakUpdate> {
    try {
      await this.initializeUser(userId);

      const { data: currentStreaks, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (streakError) {
        throw streakError;
      }

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let updateData: any = {};
      let streakUpdate: StreakUpdate;

      switch (streakType) {
        case 'quiz':
          const lastQuizDate = currentStreaks.last_quiz_date;
          if (lastQuizDate === today) {
            // Already counted today
            return {
              streak_type: 'quiz',
              current_streak: currentStreaks.quiz_streak,
              longest_streak: currentStreaks.longest_quiz_streak,
              is_new_record: false
            };
          }
          
          const newQuizStreak = lastQuizDate === yesterday ? currentStreaks.quiz_streak + 1 : 1;
          const newLongestQuizStreak = Math.max(newQuizStreak, currentStreaks.longest_quiz_streak);
          
          updateData = {
            quiz_streak: newQuizStreak,
            longest_quiz_streak: newLongestQuizStreak,
            last_quiz_date: today
          };

          streakUpdate = {
            streak_type: 'quiz',
            current_streak: newQuizStreak,
            longest_streak: newLongestQuizStreak,
            is_new_record: newQuizStreak > currentStreaks.longest_quiz_streak
          };
          break;

        case 'mentor_chat':
          const lastMentorDate = currentStreaks.last_mentor_date;
          if (lastMentorDate === today) {
            return {
              streak_type: 'mentor_chat',
              current_streak: currentStreaks.mentor_chat_streak,
              longest_streak: currentStreaks.longest_mentor_streak,
              is_new_record: false
            };
          }

          const newMentorStreak = lastMentorDate === yesterday ? currentStreaks.mentor_chat_streak + 1 : 1;
          const newLongestMentorStreak = Math.max(newMentorStreak, currentStreaks.longest_mentor_streak);

          updateData = {
            mentor_chat_streak: newMentorStreak,
            longest_mentor_streak: newLongestMentorStreak,
            last_mentor_date: today
          };

          streakUpdate = {
            streak_type: 'mentor_chat',
            current_streak: newMentorStreak,
            longest_streak: newLongestMentorStreak,
            is_new_record: newMentorStreak > currentStreaks.longest_mentor_streak
          };
          break;

        case 'daily_activity':
          const lastActivityDate = currentStreaks.last_activity_date;
          if (lastActivityDate === today) {
            return {
              streak_type: 'daily_activity',
              current_streak: currentStreaks.daily_activity_streak,
              longest_streak: currentStreaks.longest_daily_streak,
              is_new_record: false
            };
          }

          const newDailyStreak = lastActivityDate === yesterday ? currentStreaks.daily_activity_streak + 1 : 1;
          const newLongestDailyStreak = Math.max(newDailyStreak, currentStreaks.longest_daily_streak);

          updateData = {
            daily_activity_streak: newDailyStreak,
            longest_daily_streak: newLongestDailyStreak,
            last_activity_date: today
          };

          streakUpdate = {
            streak_type: 'daily_activity',
            current_streak: newDailyStreak,
            longest_streak: newLongestDailyStreak,
            is_new_record: newDailyStreak > currentStreaks.longest_daily_streak
          };
          break;
      }

      // Update the streaks
      const { error: updateError } = await supabase
        .from('user_streaks')
        .update(updateData)
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      // Award streak XP if milestone reached
      if (streakUpdate.current_streak % 7 === 0 && streakUpdate.current_streak > 0) {
        await this.awardXP(userId, {
          action: 'daily_streak_maintained',
          metadata: {
            streak_type: streakType,
            streak_length: streakUpdate.current_streak,
            milestone: true
          }
        });
        streakUpdate.streak_milestone_achieved = streakUpdate.current_streak;
      }

      console.log(`Updated ${streakType} streak for user ${userId}: ${streakUpdate.current_streak}`);
      return streakUpdate;

    } catch (error) {
      console.error('Update streak error:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive user gamification data
   */
  static async getUserProgress(userId: string): Promise<UserGamificationData> {
    try {
      await this.initializeUser(userId);

      // Get user XP data
      const { data: xpData, error: xpError } = await supabase
        .from('user_xp')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (xpError) {
        throw xpError;
      }

      // Get user achievements with badge details
      const { data: achievements, error: achievementError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          badge:badge_definitions(*)
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (achievementError) {
        throw achievementError;
      }

      // Get user streaks
      const { data: streaks, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (streakError) {
        throw streakError;
      }

      // Get recent XP transactions
      const { data: transactions, error: transactionError } = await supabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionError) {
        throw transactionError;
      }

      // Get available badges (not yet earned)
      const earnedBadgeIds = achievements.map(a => a.badge_id);
      const { data: availableBadges, error: badgeError } = await supabase
        .from('badge_definitions')
        .select('*')
        .eq('is_active', true)
        .not('id', 'in', `(${earnedBadgeIds.join(',') || 'null'})`)
        .order('sort_order');

      if (badgeError) {
        throw badgeError;
      }

      // Calculate next level requirements
      const currentLevelInfo = LEVEL_THRESHOLDS[xpData.current_level];
      const nextLevelEntry = Object.entries(LEVEL_THRESHOLDS).find(
        ([, config]) => config.min_xp > currentLevelInfo.min_xp
      );

      const nextLevelRequirements = nextLevelEntry ? {
        current_level: xpData.current_level,
        next_level: nextLevelEntry[1].level,
        xp_needed: nextLevelEntry[1].min_xp - xpData.total_xp,
        progress_percentage: xpData.level_progress
      } : {
        current_level: xpData.current_level,
        next_level: null,
        xp_needed: 0,
        progress_percentage: 100
      };

      return {
        xp: xpData,
        achievements: achievements || [],
        streaks: streaks,
        daily_challenges: [], // TODO: Implement in Phase 2
        recent_transactions: transactions || [],
        next_level_requirements: nextLevelRequirements,
        available_badges: availableBadges || []
      };

    } catch (error) {
      console.error('Get user progress error:', error);
      throw error;
    }
  }
}
import { supabase } from '../supabase';
import { 
  SeasonalEvent, 
  UserSeasonalProgress,
  SeasonalEventType,
  SkillCategory
} from '../../types/gamification';

export class SeasonalEventsService {
  /**
   * Get all active seasonal events
   */
  static async getActiveSeasonalEvents(): Promise<SeasonalEvent[]> {
    try {
      const now = new Date().toISOString();
      
      const { data: events, error } = await supabase
        .from('seasonal_events')
        .select('*')
        .eq('is_active', true)
        .lte('starts_at', now)
        .gte('ends_at', now)
        .order('starts_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch active events: ${error.message}`);
      }

      return events || [];
    } catch (error) {
      console.error('Get active seasonal events error:', error);
      throw error;
    }
  }

  /**
   * Get user's progress in seasonal events
   */
  static async getUserSeasonalProgress(userId: string): Promise<UserSeasonalProgress[]> {
    try {
      const { data: progress, error } = await supabase
        .from('user_seasonal_progress')
        .select(`
          *,
          seasonal_events!inner(*)
        `)
        .eq('user_id', userId)
        .eq('seasonal_events.is_active', true);

      if (error) {
        throw new Error(`Failed to fetch user seasonal progress: ${error.message}`);
      }

      return progress || [];
    } catch (error) {
      console.error('Get user seasonal progress error:', error);
      throw error;
    }
  }

  /**
   * Get seasonal events with user progress
   */
  static async getSeasonalEventsWithProgress(userId: string): Promise<{
    active_events: SeasonalEvent[];
    user_progress: UserSeasonalProgress[];
    community_standings: Record<string, number>;
  }> {
    try {
      // Get active events
      const activeEvents = await SeasonalEventsService.getActiveSeasonalEvents();
      
      // Get user progress
      const userProgress = await SeasonalEventsService.getUserSeasonalProgress(userId);
      
      // Get community standings for community goal events
      const communityGoalEvents = activeEvents.filter(event => event.event_type === 'community_goal');
      const communityStandings: Record<string, number> = {};
      
      for (const event of communityGoalEvents) {
        communityStandings[event.id] = event.community_progress;
      }

      return {
        active_events: activeEvents,
        user_progress: userProgress,
        community_standings: communityStandings
      };
    } catch (error) {
      console.error('Get seasonal events with progress error:', error);
      throw error;
    }
  }

  /**
   * Join a seasonal event (create initial progress entry)
   */
  static async joinSeasonalEvent(userId: string, eventId: string): Promise<UserSeasonalProgress> {
    try {
      // Check if user is already participating
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_seasonal_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Failed to check existing progress: ${checkError.message}`);
      }

      // If already participating, return existing progress
      if (existingProgress) {
        return existingProgress;
      }

      // Create new progress entry
      const { data: newProgress, error: createError } = await supabase
        .from('user_seasonal_progress')
        .insert({
          user_id: userId,
          event_id: eventId,
          participation_score: 0,
          xp_earned_during_event: 0,
          challenges_completed: 0,
          special_rewards_earned: [],
          first_participation: new Date().toISOString(),
          last_activity: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to join seasonal event: ${createError.message}`);
      }

      return newProgress;
    } catch (error) {
      console.error('Join seasonal event error:', error);
      throw error;
    }
  }

  /**
   * Update user's seasonal event progress
   */
  static async updateSeasonalProgress(
    userId: string,
    eventId: string,
    progressData: {
      xp_earned?: number;
      challenges_completed?: number;
      participation_score_increment?: number;
      special_reward?: {
        type: string;
        value: string | number;
        earned_at: string;
      };
    }
  ): Promise<UserSeasonalProgress> {
    try {
      // Get current progress
      const { data: currentProgress, error: fetchError } = await supabase
        .from('user_seasonal_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .single();

      if (fetchError) {
        // If no progress exists, create it first
        if (fetchError.code === 'PGRST116') {
          await SeasonalEventsService.joinSeasonalEvent(userId, eventId);
          return SeasonalEventsService.updateSeasonalProgress(userId, eventId, progressData);
        }
        throw new Error(`Failed to fetch current progress: ${fetchError.message}`);
      }

      // Calculate updates
      const updates: Partial<UserSeasonalProgress> = {
        last_activity: new Date().toISOString()
      };

      if (progressData.xp_earned) {
        updates.xp_earned_during_event = (currentProgress.xp_earned_during_event || 0) + progressData.xp_earned;
      }

      if (progressData.challenges_completed) {
        updates.challenges_completed = (currentProgress.challenges_completed || 0) + progressData.challenges_completed;
      }

      if (progressData.participation_score_increment) {
        updates.participation_score = (currentProgress.participation_score || 0) + progressData.participation_score_increment;
      }

      if (progressData.special_reward) {
        const currentRewards = currentProgress.special_rewards_earned || [];
        updates.special_rewards_earned = [...currentRewards, progressData.special_reward];
      }

      // Update progress
      const { data: updatedProgress, error: updateError } = await supabase
        .from('user_seasonal_progress')
        .update(updates)
        .eq('id', currentProgress.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update seasonal progress: ${updateError.message}`);
      }

      // Update community progress for community goal events
      await SeasonalEventsService.updateCommunityProgress(eventId, progressData);

      return updatedProgress;
    } catch (error) {
      console.error('Update seasonal progress error:', error);
      throw error;
    }
  }

  /**
   * Calculate XP multiplier for seasonal events
   */
  static async calculateSeasonalXPMultiplier(
    userId: string,
    skillCategory?: SkillCategory,
    activityType?: string
  ): Promise<number> {
    try {
      const activeEvents = await SeasonalEventsService.getActiveSeasonalEvents();
      let totalMultiplier = 1.0;

      for (const event of activeEvents) {
        // Check if user is participating in this event
        const { data: userProgress } = await supabase
          .from('user_seasonal_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('event_id', event.id)
          .single();

        if (!userProgress) continue; // User not participating

        // Apply XP multiplier based on event type and focus
        if (event.event_type === 'xp_boost') {
          // Check if this event applies to the current activity
          if (!event.focus_skill_category || event.focus_skill_category === skillCategory) {
            totalMultiplier *= event.xp_multiplier;
          }
        } else if (event.event_type === 'skill_focus' && event.focus_skill_category === skillCategory) {
          totalMultiplier *= event.xp_multiplier;
        }
      }

      return totalMultiplier;
    } catch (error) {
      console.error('Calculate seasonal XP multiplier error:', error);
      return 1.0; // Default multiplier if error
    }
  }

  /**
   * Check and award seasonal achievements
   */
  static async checkSeasonalAchievements(userId: string, eventId: string): Promise<Array<{
    type: string;
    value: string | number;
    earned_at: string;
  }>> {
    try {
      const { data: event, error: eventError } = await supabase
        .from('seasonal_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        return [];
      }

      const { data: userProgress, error: progressError } = await supabase
        .from('user_seasonal_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .single();

      if (progressError || !userProgress) {
        return [];
      }

      const newAchievements: Array<{
        type: string;
        value: string | number;
        earned_at: string;
      }> = [];

      const currentTime = new Date().toISOString();

      // Check for special rewards based on participation
      for (const reward of event.special_rewards) {
        const alreadyEarned = userProgress.special_rewards_earned.some(
          (earned: any) => earned.type === reward.type && earned.value === reward.value
        );

        if (alreadyEarned) continue;

        let shouldAward = false;

        // Parse reward requirements and check if met
        switch (reward.requirement) {
          case 'participate_5_days':
            // Calculate days of participation (simplified)
            const daysSinceStart = Math.floor(
              (new Date(currentTime).getTime() - new Date(userProgress.first_participation).getTime()) 
              / (1000 * 60 * 60 * 24)
            );
            shouldAward = daysSinceStart >= 5;
            break;
          
          case 'earn_1000_xp':
            shouldAward = (userProgress.xp_earned_during_event || 0) >= 1000;
            break;
          
          case 'complete_10_challenges':
            shouldAward = (userProgress.challenges_completed || 0) >= 10;
            break;
          
          case 'participation_score_100':
            shouldAward = (userProgress.participation_score || 0) >= 100;
            break;
        }

        if (shouldAward) {
          newAchievements.push({
            type: reward.type,
            value: reward.value,
            earned_at: currentTime
          });
        }
      }

      // Award achievements by updating progress
      if (newAchievements.length > 0) {
        for (const achievement of newAchievements) {
          await SeasonalEventsService.updateSeasonalProgress(userId, eventId, {
            special_reward: achievement
          });
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Check seasonal achievements error:', error);
      return [];
    }
  }

  /**
   * Update community progress for community goal events
   */
  private static async updateCommunityProgress(
    eventId: string,
    progressData: any
  ): Promise<void> {
    try {
      const { data: event, error: eventError } = await supabase
        .from('seasonal_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError || !event || event.event_type !== 'community_goal') {
        return; // Not a community goal event
      }

      // Increment community progress based on activity type
      let progressIncrement = 0;
      
      if (progressData.xp_earned) {
        progressIncrement += Math.floor(progressData.xp_earned / 10); // 1 community point per 10 XP
      }
      
      if (progressData.challenges_completed) {
        progressIncrement += progressData.challenges_completed * 5; // 5 points per challenge
      }

      if (progressIncrement > 0) {
        await supabase
          .from('seasonal_events')
          .update({
            community_progress: event.community_progress + progressIncrement
          })
          .eq('id', eventId);
      }
    } catch (error) {
      console.error('Update community progress error:', error);
    }
  }

  /**
   * Get seasonal event leaderboard
   */
  static async getSeasonalEventLeaderboard(
    eventId: string,
    limit: number = 50
  ): Promise<Array<{
    rank: number;
    anonymous_name: string;
    participation_score: number;
    xp_earned: number;
    challenges_completed: number;
    special_rewards_count: number;
  }>> {
    try {
      const { data: leaderboard, error } = await supabase
        .rpc('get_seasonal_event_leaderboard', {
          p_event_id: eventId,
          p_limit: limit
        });

      if (error) {
        throw new Error(`Failed to fetch seasonal leaderboard: ${error.message}`);
      }

      return leaderboard || [];
    } catch (error) {
      console.error('Get seasonal event leaderboard error:', error);
      throw error;
    }
  }

  /**
   * Create a new seasonal event (admin function)
   */
  static async createSeasonalEvent(eventData: {
    event_key: string;
    title: string;
    description: string;
    event_type: SeasonalEventType;
    starts_at: string;
    ends_at: string;
    xp_multiplier?: number;
    focus_skill_category?: SkillCategory;
    special_rewards?: Array<{
      type: 'badge' | 'xp' | 'title';
      value: string | number;
      requirement: string;
    }>;
    community_target?: number;
    theme_color?: string;
    icon_name?: string;
  }): Promise<SeasonalEvent> {
    try {
      const { data: newEvent, error } = await supabase
        .from('seasonal_events')
        .insert({
          event_key: eventData.event_key,
          title: eventData.title,
          description: eventData.description,
          event_type: eventData.event_type,
          starts_at: eventData.starts_at,
          ends_at: eventData.ends_at,
          is_active: true,
          xp_multiplier: eventData.xp_multiplier || 1.0,
          focus_skill_category: eventData.focus_skill_category || null,
          special_rewards: eventData.special_rewards || [],
          community_target: eventData.community_target || null,
          community_progress: 0,
          theme_color: eventData.theme_color || 'purple',
          banner_image: null,
          icon_name: eventData.icon_name || 'star'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create seasonal event: ${error.message}`);
      }

      return newEvent;
    } catch (error) {
      console.error('Create seasonal event error:', error);
      throw error;
    }
  }

  /**
   * Get upcoming seasonal events
   */
  static async getUpcomingSeasonalEvents(): Promise<SeasonalEvent[]> {
    try {
      const now = new Date().toISOString();
      
      const { data: events, error } = await supabase
        .from('seasonal_events')
        .select('*')
        .eq('is_active', true)
        .gt('starts_at', now)
        .order('starts_at', { ascending: true })
        .limit(5);

      if (error) {
        throw new Error(`Failed to fetch upcoming events: ${error.message}`);
      }

      return events || [];
    } catch (error) {
      console.error('Get upcoming seasonal events error:', error);
      throw error;
    }
  }
}
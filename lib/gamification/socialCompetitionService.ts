// DevPath Chronicles Social Competition Service
// Phase 2: Social Competition Layer

import { supabase } from '../supabaseClient';
import {
  LeaderboardEntry,
  LeaderboardData,
  LeaderboardPeriod,
  SkillCategory,
  Guild,
  GuildMembership,
  GuildChallenge,
  EnhancedUserDailyChallenge,
  ChallengeTemplate,
  SocialInteraction,
  AnonymousName,
  SocialUserGamificationData,
  CreateGuildRequest,
  JoinGuildRequest,
  GuildChallengeRequest,
  EnhancedChallengeType
} from '../../types/gamification';

export class SocialCompetitionService {
  
  /**
   * Generate anonymous name for leaderboards
   */
  static async generateAnonymousName(userId: string, skillCategory: SkillCategory): Promise<string> {
    try {
      // Check if user already has an anonymous name for this category
      const { data: existingName } = await supabase
        .from('anonymous_names')
        .select('anonymous_name')
        .eq('user_id', userId)
        .eq('skill_category', skillCategory)
        .single();

      if (existingName) {
        return existingName.anonymous_name;
      }

      // Generate new anonymous name
      const prefixes = ['Code', 'Logic', 'Query', 'Debug', 'Script', 'Data', 'Byte', 'Syntax'];
      const suffixes = ['Ninja', 'Master', 'Wizard', 'Hunter', 'Sage', 'Knight', 'Pro', 'Guru'];
      const numbers = Math.floor(Math.random() * 99) + 1;
      
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      const anonymousName = `${prefix}${suffix}${numbers}`;

      // Store the anonymous name
      await supabase
        .from('anonymous_names')
        .insert({
          user_id: userId,
          skill_category: skillCategory,
          anonymous_name: anonymousName,
          name_seed: Date.now() % 10000
        });

      return anonymousName;
    } catch (error) {
      console.error('Generate anonymous name error:', error);
      return `Anonymous${Math.floor(Math.random() * 1000)}`;
    }
  }

  /**
   * Update user's leaderboard entry
   */
  static async updateLeaderboardEntry(
    userId: string, 
    skillCategory: SkillCategory, 
    timePeriod: LeaderboardPeriod,
    metrics: {
      xp_earned?: number;
      quizzes_completed?: number;
      perfect_scores?: number;
      streak_days?: number;
    }
  ): Promise<void> {
    try {
      // Get current period boundaries
      const { periodStart, periodEnd } = this.getPeriodBoundaries(timePeriod);
      
      // Get anonymous name
      const anonymousName = await this.generateAnonymousName(userId, skillCategory);

      // Calculate total score (weighted combination of metrics)
      const score = (metrics.xp_earned || 0) + 
                   (metrics.quizzes_completed || 0) * 10 + 
                   (metrics.perfect_scores || 0) * 25 + 
                   (metrics.streak_days || 0) * 5;

      // Upsert leaderboard entry
      const { error } = await supabase
        .from('leaderboards')
        .upsert({
          user_id: userId,
          skill_category: skillCategory,
          time_period: timePeriod,
          period_start: periodStart,
          period_end: periodEnd,
          user_score: score,
          anonymous_name: anonymousName,
          xp_earned: metrics.xp_earned || 0,
          quizzes_completed: metrics.quizzes_completed || 0,
          perfect_scores: metrics.perfect_scores || 0,
          streak_days: metrics.streak_days || 0,
          user_rank: 1 // Will be updated by recalculateRankings
        }, {
          onConflict: 'user_id,skill_category,time_period,period_start'
        });

      if (error) {
        throw error;
      }

      // Recalculate rankings for this category and period
      await this.recalculateRankings(skillCategory, timePeriod, periodStart);

    } catch (error) {
      console.error('Update leaderboard entry error:', error);
      throw error;
    }
  }

  /**
   * Get period boundaries for leaderboard calculations
   */
  private static getPeriodBoundaries(timePeriod: LeaderboardPeriod): { periodStart: string; periodEnd: string } {
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    switch (timePeriod) {
      case 'daily':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 1);
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - dayOfWeek);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 7);
        break;
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'all_time':
      default:
        periodStart = new Date('2025-01-01');
        periodEnd = new Date('2030-12-31');
        break;
    }

    return {
      periodStart: periodStart.toISOString().split('T')[0],
      periodEnd: periodEnd.toISOString().split('T')[0]
    };
  }

  /**
   * Recalculate rankings for a specific leaderboard
   */
  private static async recalculateRankings(
    skillCategory: SkillCategory, 
    timePeriod: LeaderboardPeriod, 
    periodStart: string
  ): Promise<void> {
    try {
      // Get all entries for this leaderboard, ordered by score
      const { data: entries, error } = await supabase
        .from('leaderboards')
        .select('id, user_score')
        .eq('skill_category', skillCategory)
        .eq('time_period', timePeriod)
        .eq('period_start', periodStart)
        .order('user_score', { ascending: false });

      if (error || !entries) {
        throw error || new Error('No entries found');
      }

      // Update rankings
      const updates = entries.map((entry, index) => ({
        id: entry.id,
        user_rank: index + 1
      }));

      // Batch update rankings
      for (const update of updates) {
        await supabase
          .from('leaderboards')
          .update({ user_rank: update.user_rank })
          .eq('id', update.id);
      }

    } catch (error) {
      console.error('Recalculate rankings error:', error);
    }
  }

  /**
   * Get leaderboard data
   */
  static async getLeaderboard(
    skillCategory: SkillCategory, 
    timePeriod: LeaderboardPeriod,
    userId?: string,
    limit: number = 50
  ): Promise<LeaderboardData> {
    try {
      const { periodStart, periodEnd } = this.getPeriodBoundaries(timePeriod);

      // Get leaderboard entries
      const { data: entries, error } = await supabase
        .from('leaderboards')
        .select('*')
        .eq('skill_category', skillCategory)
        .eq('time_period', timePeriod)
        .eq('period_start', periodStart)
        .order('user_rank', { ascending: true })
        .limit(limit);

      if (error) {
        throw error;
      }

      // Get total participants count
      const { count: totalParticipants } = await supabase
        .from('leaderboards')
        .select('*', { count: 'exact', head: true })
        .eq('skill_category', skillCategory)
        .eq('time_period', timePeriod)
        .eq('period_start', periodStart);

      // Find user's entry if userId provided
      let userEntry: LeaderboardEntry | undefined;
      let userRank: number | undefined;

      if (userId) {
        const { data: userEntryData } = await supabase
          .from('leaderboards')
          .select('*')
          .eq('skill_category', skillCategory)
          .eq('time_period', timePeriod)
          .eq('period_start', periodStart)
          .eq('user_id', userId)
          .single();

        if (userEntryData) {
          userEntry = userEntryData;
          userRank = userEntryData.user_rank;
        }
      }

      return {
        skill_category: skillCategory,
        time_period: timePeriod,
        entries: entries || [],
        total_participants: totalParticipants || 0,
        user_rank: userRank,
        user_entry: userEntry,
        period_start: periodStart,
        period_end: periodEnd
      };

    } catch (error) {
      console.error('Get leaderboard error:', error);
      throw error;
    }
  }

  /**
   * Create a new guild
   */
  static async createGuild(userId: string, guildData: CreateGuildRequest): Promise<Guild> {
    try {
      const { data: guild, error } = await supabase
        .from('guilds')
        .insert({
          name: guildData.name.toLowerCase().replace(/\s+/g, '-'),
          display_name: guildData.display_name,
          description: guildData.description,
          skill_focus: guildData.skill_focus,
          guild_type: guildData.guild_type,
          max_members: guildData.max_members || 50,
          is_public: guildData.is_public !== false,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add creator as founder
      await supabase
        .from('guild_memberships')
        .insert({
          guild_id: guild.id,
          user_id: userId,
          role: 'founder'
        });

      // Update guild member count
      await supabase
        .from('guilds')
        .update({ current_members: 1 })
        .eq('id', guild.id);

      return guild;
    } catch (error) {
      console.error('Create guild error:', error);
      throw error;
    }
  }

  /**
   * Join a guild
   */
  static async joinGuild(userId: string, joinData: JoinGuildRequest): Promise<GuildMembership> {
    try {
      // Get guild info and check capacity
      const { data: guild, error: guildError } = await supabase
        .from('guilds')
        .select('*')
        .eq('id', joinData.guild_id)
        .single();

      if (guildError || !guild) {
        throw new Error('Guild not found');
      }

      if (guild.current_members >= guild.max_members) {
        throw new Error('Guild is full');
      }

      if (!guild.is_public && guild.join_code !== joinData.join_code) {
        throw new Error('Invalid join code');
      }

      // Check if user is already a member
      const { data: existingMembership } = await supabase
        .from('guild_memberships')
        .select('*')
        .eq('guild_id', joinData.guild_id)
        .eq('user_id', userId)
        .single();

      if (existingMembership && existingMembership.is_active) {
        throw new Error('Already a member of this guild');
      }

      // Create or reactivate membership
      const { data: membership, error: membershipError } = await supabase
        .from('guild_memberships')
        .upsert({
          guild_id: joinData.guild_id,
          user_id: userId,
          role: 'member',
          is_active: true,
          joined_at: new Date().toISOString()
        })
        .select()
        .single();

      if (membershipError) {
        throw membershipError;
      }

      // Update guild member count
      await supabase
        .from('guilds')
        .update({ 
          current_members: guild.current_members + 1 
        })
        .eq('id', joinData.guild_id);

      // Record social interaction
      await this.recordSocialInteraction(userId, 'guild_join', {
        guild_id: joinData.guild_id,
        guild_name: guild.display_name
      });

      return membership;
    } catch (error) {
      console.error('Join guild error:', error);
      throw error;
    }
  }

  /**
   * Leave a guild
   */
  static async leaveGuild(userId: string, guildId: string): Promise<void> {
    try {
      // Update membership to inactive
      const { error: membershipError } = await supabase
        .from('guild_memberships')
        .update({ 
          is_active: false,
          last_active_at: new Date().toISOString() 
        })
        .eq('guild_id', guildId)
        .eq('user_id', userId);

      if (membershipError) {
        throw membershipError;
      }

      // Update guild member count
      const { data: guild } = await supabase
        .from('guilds')
        .select('current_members, display_name')
        .eq('id', guildId)
        .single();

      if (guild) {
        await supabase
          .from('guilds')
          .update({ 
            current_members: Math.max(0, guild.current_members - 1) 
          })
          .eq('id', guildId);

        // Record social interaction
        await this.recordSocialInteraction(userId, 'guild_leave', {
          guild_id: guildId,
          guild_name: guild.display_name
        });
      }

    } catch (error) {
      console.error('Leave guild error:', error);
      throw error;
    }
  }

  /**
   * Get user's guilds and available guilds
   */
  static async getUserGuilds(userId: string): Promise<{
    user_guilds: Guild[];
    user_memberships: GuildMembership[];
    recommended_guilds: Guild[];
  }> {
    try {
      // Get user's guild memberships
      const { data: memberships, error: membershipError } = await supabase
        .from('guild_memberships')
        .select(`
          *,
          guild:guilds(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (membershipError) {
        throw membershipError;
      }

      const userGuilds = memberships?.map(m => m.guild).filter(Boolean) || [];
      const userGuildIds = userGuilds.map(g => g.id);

      // Get recommended guilds (public guilds user hasn't joined)
      let recommendedGuildsQuery = supabase
        .from('guilds')
        .select('*')
        .eq('is_public', true)
        .order('current_members', { ascending: false })
        .limit(10);

      // Only add the NOT IN clause if user has guilds
      if (userGuildIds.length > 0) {
        recommendedGuildsQuery = recommendedGuildsQuery.not('id', 'in', `(${userGuildIds.join(',')})`);
      }

      const { data: recommendedGuilds, error: recommendedError } = await recommendedGuildsQuery;

      if (recommendedError) {
        throw recommendedError;
      }

      return {
        user_guilds: userGuilds,
        user_memberships: memberships || [],
        recommended_guilds: recommendedGuilds || []
      };

    } catch (error) {
      console.error('Get user guilds error:', error);
      throw error;
    }
  }

  /**
   * Assign daily challenges to user
   */
  static async assignDailyChallenges(userId: string): Promise<EnhancedUserDailyChallenge[]> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Check if user already has challenges for today
      const { data: existingChallenges } = await supabase
        .from('user_daily_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('assigned_date', today);

      if (existingChallenges && existingChallenges.length > 0) {
        // Return existing challenges with template data
        const { data: challengesWithTemplates } = await supabase
          .from('user_daily_challenges')
          .select(`
            *,
            template:challenge_templates(*),
            guild:guilds(*)
          `)
          .eq('user_id', userId)
          .eq('assigned_date', today);

        return challengesWithTemplates || [];
      }

      // Get user's guild memberships for social challenges
      const { data: guildMemberships } = await supabase
        .from('guild_memberships')
        .select('guild_id')
        .eq('user_id', userId)
        .eq('is_active', true);

      const hasGuildMembership = guildMemberships && guildMemberships.length > 0;

      // Get available challenge templates
      const { data: templates, error: templateError } = await supabase
        .from('challenge_templates')
        .select('*')
        .eq('is_active', true)
        .eq('frequency', 'daily');

      if (templateError || !templates) {
        throw templateError || new Error('No challenge templates found');
      }

      // Filter templates based on user's social status
      const availableTemplates = templates.filter(template => {
        if (template.is_social && !hasGuildMembership) {
          return false; // Skip social challenges if user has no guild
        }
        return true;
      });

      // Select 3-5 challenges for the day
      const numChallenges = Math.min(5, Math.max(3, availableTemplates.length));
      const selectedTemplates = this.shuffleArray(availableTemplates).slice(0, numChallenges);

      // Create user challenge entries
      const userChallenges = selectedTemplates.map(template => ({
        user_id: userId,
        template_id: template.id,
        target_progress: template.target_value,
        assigned_date: today,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        guild_challenge: template.is_social && hasGuildMembership,
        guild_id: template.is_social && hasGuildMembership ? guildMemberships[0].guild_id : null
      }));

      // Insert challenges
      const { data: insertedChallenges, error: insertError } = await supabase
        .from('user_daily_challenges')
        .insert(userChallenges)
        .select(`
          *,
          template:challenge_templates(*),
          guild:guilds(*)
        `);

      if (insertError) {
        throw insertError;
      }

      return insertedChallenges || [];

    } catch (error) {
      console.error('Assign daily challenges error:', error);
      throw error;
    }
  }

  /**
   * Record social interaction
   */
  private static async recordSocialInteraction(
    fromUserId: string,
    interactionType: SocialInteraction['interaction_type'],
    metadata: Record<string, any> = {},
    toUserId?: string,
    guildId?: string
  ): Promise<void> {
    try {
      await supabase
        .from('social_interactions')
        .insert({
          from_user_id: fromUserId,
          to_user_id: toUserId,
          interaction_type: interactionType,
          guild_id: guildId,
          metadata
        });
    } catch (error) {
      console.error('Record social interaction error:', error);
      // Don't throw - this is non-critical
    }
  }

  /**
   * Utility function to shuffle array
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
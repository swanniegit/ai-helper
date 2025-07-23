import { supabase } from '../supabase';
import { 
  Quest, 
  UserQuest, 
  QuestStatus,
  QuestType,
  StartQuestRequest,
  UpdateQuestProgressRequest
} from '../../types/gamification';

export class QuestService {
  /**
   * Get available quests for user
   */
  static async getAvailableQuests(userId: string): Promise<Quest[]> {
    try {
      // First, unlock any new quests the user may be eligible for
      await supabase.rpc('unlock_available_quests', { p_user_id: userId });

      // Get available quests
      const { data: quests, error } = await supabase
        .from('quests')
        .select('*')
        .eq('id', supabase
          .from('user_quests')
          .select('quest_id')
          .eq('user_id', userId)
          .eq('status', 'available')
        );

      if (error) {
        throw new Error(`Failed to fetch available quests: ${error.message}`);
      }

      return quests || [];
    } catch (error) {
      console.error('Get available quests error:', error);
      throw error;
    }
  }

  /**
   * Get user's active quests
   */
  static async getActiveQuests(userId: string): Promise<Array<UserQuest & { quest: Quest }>> {
    try {
      const { data: userQuests, error } = await supabase
        .from('user_quests')
        .select(`
          *,
          quests!inner(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('started_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch active quests: ${error.message}`);
      }

      return (userQuests || []).map(uq => ({
        ...uq,
        quest: uq.quests
      }));
    } catch (error) {
      console.error('Get active quests error:', error);
      throw error;
    }
  }

  /**
   * Get user's completed quests
   */
  static async getCompletedQuests(userId: string): Promise<Array<UserQuest & { quest: Quest }>> {
    try {
      const { data: userQuests, error } = await supabase
        .from('user_quests')
        .select(`
          *,
          quests!inner(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch completed quests: ${error.message}`);
      }

      return (userQuests || []).map(uq => ({
        ...uq,
        quest: uq.quests
      }));
    } catch (error) {
      console.error('Get completed quests error:', error);
      throw error;
    }
  }

  /**
   * Get complete quest system data for user
   */
  static async getQuestSystemData(userId: string): Promise<{
    available_quests: Quest[];
    active_quests: Array<UserQuest & { quest: Quest }>;
    completed_quests: Array<UserQuest & { quest: Quest }>;
    quest_achievements: any[];
    storylines: any[];
    npcs: any[];
  }> {
    try {
      const [availableQuests, activeQuests, completedQuests, storylines, npcs] = await Promise.all([
        QuestService.getAvailableQuests(userId),
        QuestService.getActiveQuests(userId),
        QuestService.getCompletedQuests(userId),
        QuestService.getQuestStorylines(),
        QuestService.getQuestNPCs()
      ]);

      return {
        available_quests: availableQuests,
        active_quests: activeQuests,
        completed_quests: completedQuests,
        quest_achievements: [], // TODO: Implement quest-specific achievements
        storylines: storylines,
        npcs: npcs
      };
    } catch (error) {
      console.error('Get quest system data error:', error);
      throw error;
    }
  }

  /**
   * Start a quest
   */
  static async startQuest(userId: string, request: StartQuestRequest): Promise<UserQuest> {
    try {
      // Check if quest is available for user
      const { data: existingUserQuest, error: checkError } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', userId)
        .eq('quest_id', request.quest_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Failed to check quest availability: ${checkError.message}`);
      }

      if (!existingUserQuest) {
        throw new Error('Quest not available for user');
      }

      if (existingUserQuest.status !== 'available') {
        throw new Error(`Quest is ${existingUserQuest.status}, cannot start`);
      }

      // Update quest status to active
      const { data: updatedQuest, error: updateError } = await supabase
        .from('user_quests')
        .update({
          status: 'active',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUserQuest.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to start quest: ${updateError.message}`);
      }

      // Initialize quest steps
      await QuestService.initializeQuestSteps(userId, existingUserQuest.id, request.quest_id);

      return updatedQuest;
    } catch (error) {
      console.error('Start quest error:', error);
      throw error;
    }
  }

  /**
   * Update quest progress
   */
  static async updateQuestProgress(
    userId: string,
    request: UpdateQuestProgressRequest
  ): Promise<UserQuest> {
    try {
      // Get current user quest
      const { data: userQuest, error: fetchError } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', userId)
        .eq('id', request.user_quest_id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch user quest: ${fetchError.message}`);
      }

      // Update objective progress
      const updatedObjectives = userQuest.objectives_progress.map((obj: any) => {
        if (obj.objective_id === request.objective_id) {
          const newProgress = Math.min(obj.current_progress + request.progress_value, obj.target_value);
          return {
            ...obj,
            current_progress: newProgress,
            completed_at: newProgress >= obj.target_value ? new Date().toISOString() : obj.completed_at
          };
        }
        return obj;
      });

      // Check if quest is completed
      const allObjectivesComplete = updatedObjectives.every((obj: any) => obj.current_progress >= obj.target_value);
      const newStatus = allObjectivesComplete ? 'completed' : userQuest.status;

      // Update user quest
      const updates: Partial<UserQuest> = {
        objectives_progress: updatedObjectives,
        status: newStatus as QuestStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'completed' && userQuest.status !== 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { data: updatedQuest, error: updateError } = await supabase
        .from('user_quests')
        .update(updates)
        .eq('id', request.user_quest_id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update quest progress: ${updateError.message}`);
      }

      // Award XP if quest was completed
      if (newStatus === 'completed' && userQuest.status !== 'completed') {
        await QuestService.awardQuestCompletionRewards(userId, request.user_quest_id);
      }

      return updatedQuest;
    } catch (error) {
      console.error('Update quest progress error:', error);
      throw error;
    }
  }

  /**
   * Get quest details with steps and dialogue
   */
  static async getQuestDetails(questId: string): Promise<{
    quest: Quest;
    steps: any[];
    npc: any;
    dialogues: any[];
  }> {
    try {
      // Get quest details
      const { data: quest, error: questError } = await supabase
        .from('quests')
        .select('*')
        .eq('id', questId)
        .single();

      if (questError) {
        throw new Error(`Failed to fetch quest: ${questError.message}`);
      }

      // Get quest steps
      const { data: steps, error: stepsError } = await supabase
        .from('quest_steps')
        .select('*')
        .eq('quest_id', questId)
        .order('step_order', { ascending: true });

      if (stepsError) {
        throw new Error(`Failed to fetch quest steps: ${stepsError.message}`);
      }

      // Get quest NPC by name (simplified lookup)
      const { data: npc, error: npcError } = await supabase
        .from('quest_npcs')
        .select('*')
        .eq('npc_name', quest.quest_giver_name)
        .single();

      // Get related dialogues
      const { data: dialogues, error: dialoguesError } = await supabase
        .from('quest_dialogues')
        .select('*')
        .eq('npc_id', npc?.id || '')
        .order('created_at', { ascending: true });

      return {
        quest,
        steps: steps || [],
        npc: npc || null,
        dialogues: dialogues || []
      };
    } catch (error) {
      console.error('Get quest details error:', error);
      throw error;
    }
  }

  /**
   * Get quest storylines
   */
  static async getQuestStorylines(): Promise<any[]> {
    try {
      const { data: storylines, error } = await supabase
        .from('quest_storylines')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch storylines: ${error.message}`);
      }

      return storylines || [];
    } catch (error) {
      console.error('Get quest storylines error:', error);
      throw error;
    }
  }

  /**
   * Get quest NPCs
   */
  static async getQuestNPCs(): Promise<any[]> {
    try {
      const { data: npcs, error } = await supabase
        .from('quest_npcs')
        .select('*')
        .eq('is_active', true)
        .order('appears_at_level', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch NPCs: ${error.message}`);
      }

      return npcs || [];
    } catch (error) {
      console.error('Get quest NPCs error:', error);
      throw error;
    }
  }

  /**
   * Get quest dialogue for specific context
   */
  static async getQuestDialogue(
    npcId: string,
    contextType: string,
    userId: string
  ): Promise<any | null> {
    try {
      // Get user level for dialogue requirements
      const { data: userXP, error: xpError } = await supabase
        .from('user_xp')
        .select('total_xp, current_level')
        .eq('user_id', userId)
        .single();

      const userLevel = QuestService.getNumericLevel(userXP?.current_level || 'Code Apprentice');

      // Get appropriate dialogue
      const { data: dialogue, error } = await supabase
        .from('quest_dialogues')
        .select('*')
        .eq('npc_id', npcId)
        .eq('context_type', contextType)
        .lte('required_user_level', userLevel)
        .order('required_user_level', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch dialogue: ${error.message}`);
      }

      return dialogue || null;
    } catch (error) {
      console.error('Get quest dialogue error:', error);
      return null;
    }
  }

  /**
   * Initialize quest steps for a newly started quest
   */
  private static async initializeQuestSteps(
    userId: string,
    userQuestId: string,
    questId: string
  ): Promise<void> {
    try {
      // Get quest steps
      const { data: steps, error: stepsError } = await supabase
        .from('quest_steps')
        .select('*')
        .eq('quest_id', questId)
        .order('step_order', { ascending: true });

      if (stepsError) {
        throw new Error(`Failed to fetch quest steps: ${stepsError.message}`);
      }

      // Create user quest step records
      for (const step of steps || []) {
        const stepStatus = step.step_order === 1 ? 'available' : 'locked';
        
        await supabase
          .from('user_quest_steps')
          .insert({
            user_quest_id: userQuestId,
            quest_step_id: step.id,
            status: stepStatus,
            progress_data: {}
          });
      }
    } catch (error) {
      console.error('Initialize quest steps error:', error);
    }
  }

  /**
   * Award rewards for quest completion
   */
  private static async awardQuestCompletionRewards(userId: string, userQuestId: string): Promise<void> {
    try {
      // Get quest details
      const { data: userQuest, error: questError } = await supabase
        .from('user_quests')
        .select(`
          *,
          quests!inner(*)
        `)
        .eq('id', userQuestId)
        .single();

      if (questError || !userQuest) {
        console.error('Failed to fetch quest for rewards:', questError);
        return;
      }

      // Award XP
      const { GamificationService } = await import('./gamificationService');
      await GamificationService.awardXP(
        userId,
        userQuest.quests.xp_reward,
        'quest_completed',
        `Completed quest: ${userQuest.quests.title}`
      );

      // Award badge if specified
      if (userQuest.quests.badge_reward) {
        // TODO: Award specific badge
      }

      // Unlock follow-up quests if any
      if (userQuest.quests.unlock_quests && userQuest.quests.unlock_quests.length > 0) {
        await supabase.rpc('unlock_available_quests', { p_user_id: userId });
      }

    } catch (error) {
      console.error('Award quest completion rewards error:', error);
    }
  }

  /**
   * Helper: Convert DevLevel to numeric value
   */
  private static getNumericLevel(devLevel: string): number {
    const levelMap = {
      'Code Apprentice': 1,
      'Bug Hunter': 2,
      'Logic Architect': 3,
      'Code Wizard': 4,
      'Dev Sage': 5
    };
    
    return levelMap[devLevel as keyof typeof levelMap] || 1;
  }

  /**
   * Track quest-related activity and update progress automatically
   */
  static async trackQuestActivity(
    userId: string,
    activityType: 'quiz_completed' | 'skill_completed' | 'mentor_session' | 'guild_joined',
    activityData: any
  ): Promise<void> {
    try {
      // Get user's active quests
      const activeQuests = await QuestService.getActiveQuests(userId);

      for (const userQuest of activeQuests) {
        let progressMade = false;

        // Check each objective to see if this activity contributes
        for (const objective of userQuest.objectives_progress) {
          if (objective.is_completed) continue;

          let shouldUpdate = false;
          let progressIncrement = 0;

          switch (activityType) {
            case 'quiz_completed':
              if (objective.target_type === 'quiz_score' && activityData.score >= objective.target_value) {
                shouldUpdate = true;
                progressIncrement = objective.target_value;
              }
              break;
            
            case 'skill_completed':
              if (objective.target_type === 'skill_complete' && 
                  userQuest.quest.required_skills?.includes(activityData.skill_key)) {
                shouldUpdate = true;
                progressIncrement = 1;
              }
              break;
            
            case 'mentor_session':
              if (objective.target_type === 'mentor_sessions') {
                shouldUpdate = true;
                progressIncrement = 1;
              }
              break;
            
            case 'guild_joined':
              if (objective.target_type === 'guild_join') {
                shouldUpdate = true;
                progressIncrement = 1;
              }
              break;
          }

          if (shouldUpdate) {
            await QuestService.updateQuestProgress(userId, {
              user_quest_id: userQuest.id,
              objective_id: objective.objective_id,
              progress_value: progressIncrement
            });
            progressMade = true;
          }
        }
      }
    } catch (error) {
      console.error('Track quest activity error:', error);
    }
  }
}
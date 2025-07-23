import { supabase } from '../supabase';
import { 
  SkillTreeVisualization, 
  EnhancedSkillTreeNode, 
  UserSkillProgress,
  UserSkillPath,
  SkillTreePath,
  SkillNodeStatus,
  StartSkillLearningRequest,
  UpdateSkillProgressRequest,
  ChooseSkillPathRequest
} from '../../types/gamification';

export class SkillTreeService {
  /**
   * Get complete skill tree visualization data for a specific path
   */
  static async getSkillTreeVisualization(
    userId: string, 
    treePath: SkillTreePath
  ): Promise<SkillTreeVisualization> {
    try {
      // Fetch skill tree nodes with prerequisites
      const { data: skillNodes, error: nodesError } = await supabase
        .from('skill_nodes_with_prerequisites')
        .select('*')
        .eq('tree_path', treePath)
        .order('tier', { ascending: true })
        .order('position_y', { ascending: true });

      if (nodesError) {
        throw new Error(`Failed to fetch skill nodes: ${nodesError.message}`);
      }

      // Fetch user's skill progress
      const { data: userProgress, error: progressError } = await supabase
        .from('user_skill_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) {
        throw new Error(`Failed to fetch user progress: ${progressError.message}`);
      }

      // Get user's current XP and level for unlock calculations
      const { data: userXP, error: xpError } = await supabase
        .from('user_xp')
        .select('total_xp, current_level')
        .eq('user_id', userId)
        .single();

      if (xpError && xpError.code !== 'PGRST116') {
        throw new Error(`Failed to fetch user XP: ${xpError.message}`);
      }

      const currentXP = userXP?.total_xp || 0;
      const currentLevel = SkillTreeService.getNumericLevel(userXP?.current_level || 'Code Apprentice');

      // Create progress map for easy lookup
      const progressMap = new Map<string, UserSkillProgress>();
      userProgress?.forEach(progress => {
        progressMap.set(progress.skill_node_id, progress);
      });

      // Enhance nodes with user progress and unlock status
      const enhancedNodes: EnhancedSkillTreeNode[] = skillNodes.map(node => {
        const userProgressData = progressMap.get(node.id);
        const isUnlocked = SkillTreeService.isSkillUnlocked(
          node,
          enhancedNodes,
          progressMap,
          currentXP,
          currentLevel
        );

        return {
          ...node,
          prerequisites: node.prerequisites || [],
          user_progress: userProgressData,
          is_unlocked: isUnlocked,
          unlock_reason: isUnlocked ? undefined : SkillTreeService.getUnlockReason(
            node,
            enhancedNodes,
            progressMap,
            currentXP,
            currentLevel
          )
        };
      });

      // Generate connections data
      const connections = enhancedNodes.flatMap(node =>
        node.prerequisites.map(prereq => ({
          from_node_id: enhancedNodes.find(n => n.node_key === prereq.node_key)?.id || '',
          to_node_id: node.id,
          is_required: prereq.is_required
        }))
      ).filter(conn => conn.from_node_id);

      // Calculate user stats
      const userStats = {
        total_nodes: enhancedNodes.length,
        completed_nodes: enhancedNodes.filter(n => 
          n.user_progress?.status === 'completed' || n.user_progress?.status === 'mastered'
        ).length,
        mastered_nodes: enhancedNodes.filter(n => 
          n.user_progress?.status === 'mastered'
        ).length,
        total_xp_earned: enhancedNodes.reduce((total, node) => 
          total + (node.user_progress?.xp_earned || 0), 0
        ),
        completion_percentage: enhancedNodes.length > 0 
          ? (enhancedNodes.filter(n => 
              n.user_progress?.status === 'completed' || n.user_progress?.status === 'mastered'
            ).length / enhancedNodes.length) * 100 
          : 0
      };

      return {
        tree_path: treePath,
        nodes: enhancedNodes,
        connections,
        user_stats: userStats
      };

    } catch (error) {
      console.error('Skill tree visualization error:', error);
      throw error;
    }
  }

  /**
   * Start learning a specific skill
   */
  static async startSkillLearning(
    userId: string, 
    request: StartSkillLearningRequest
  ): Promise<UserSkillProgress> {
    try {
      // Check if skill is already being tracked
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_skill_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_node_id', request.skill_node_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Failed to check existing progress: ${checkError.message}`);
      }

      // If already exists and not locked, update status to in_progress
      if (existingProgress) {
        const { data: updatedProgress, error: updateError } = await supabase
          .from('user_skill_progress')
          .update({
            status: 'in_progress',
            started_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Failed to update skill progress: ${updateError.message}`);
        }

        return updatedProgress;
      }

      // Create new progress entry
      const { data: newProgress, error: createError } = await supabase
        .from('user_skill_progress')
        .insert({
          user_id: userId,
          skill_node_id: request.skill_node_id,
          status: 'in_progress',
          progress_percentage: 0,
          xp_earned: 0,
          time_spent_minutes: 0,
          quiz_attempts: 0,
          mentor_sessions: 0,
          learning_resources_accessed: 0,
          started_at: new Date().toISOString(),
          learning_plan_id: request.learning_plan_id || null
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create skill progress: ${createError.message}`);
      }

      return newProgress;

    } catch (error) {
      console.error('Start skill learning error:', error);
      throw error;
    }
  }

  /**
   * Update skill progress
   */
  static async updateSkillProgress(
    userId: string,
    request: UpdateSkillProgressRequest
  ): Promise<UserSkillProgress> {
    try {
      // Get current progress
      const { data: currentProgress, error: fetchError } = await supabase
        .from('user_skill_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_node_id', request.skill_node_id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch current progress: ${fetchError.message}`);
      }

      // Calculate new progress
      const newProgressPercentage = Math.min(
        100,
        currentProgress.progress_percentage + request.progress_increment
      );

      // Determine new status
      let newStatus: SkillNodeStatus = currentProgress.status;
      if (newProgressPercentage >= 100 && currentProgress.status !== 'completed' && currentProgress.status !== 'mastered') {
        newStatus = 'completed';
      }

      // Update activity counters
      const updates: Partial<UserSkillProgress> = {
        progress_percentage: newProgressPercentage,
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Add completion timestamp if newly completed
      if (newStatus === 'completed' && currentProgress.status !== 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      // Update activity-specific counters
      switch (request.activity_type) {
        case 'quiz':
          updates.quiz_attempts = (currentProgress.quiz_attempts || 0) + 1;
          break;
        case 'mentor_session':
          updates.mentor_sessions = (currentProgress.mentor_sessions || 0) + 1;
          break;
        case 'resource_access':
          updates.learning_resources_accessed = (currentProgress.learning_resources_accessed || 0) + 1;
          break;
      }

      // Update progress
      const { data: updatedProgress, error: updateError } = await supabase
        .from('user_skill_progress')
        .update(updates)
        .eq('id', currentProgress.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update skill progress: ${updateError.message}`);
      }

      // If skill was completed, award XP
      if (newStatus === 'completed' && currentProgress.status !== 'completed') {
        await SkillTreeService.awardSkillCompletionXP(userId, request.skill_node_id);
      }

      return updatedProgress;

    } catch (error) {
      console.error('Update skill progress error:', error);
      throw error;
    }
  }

  /**
   * Choose a skill path for the user
   */
  static async chooseSkillPath(
    userId: string,
    request: ChooseSkillPathRequest
  ): Promise<UserSkillPath> {
    try {
      // If setting as primary, remove primary flag from other paths
      if (request.is_primary) {
        await supabase
          .from('user_skill_paths')
          .update({ is_primary: false })
          .eq('user_id', userId);
      }

      // Upsert the skill path
      const { data: skillPath, error } = await supabase
        .from('user_skill_paths')
        .upsert({
          user_id: userId,
          path_name: request.path_name,
          is_primary: request.is_primary,
          chosen_at: new Date().toISOString(),
          progress_percentage: 0,
          path_xp_bonus: 0
        }, {
          onConflict: 'user_id,path_name'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to choose skill path: ${error.message}`);
      }

      return skillPath;

    } catch (error) {
      console.error('Choose skill path error:', error);
      throw error;
    }
  }

  /**
   * Get user's skill paths
   */
  static async getUserSkillPaths(userId: string): Promise<UserSkillPath[]> {
    try {
      const { data: skillPaths, error } = await supabase
        .from('user_skill_paths')
        .select('*')
        .eq('user_id', userId)
        .order('is_primary', { ascending: false })
        .order('chosen_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch skill paths: ${error.message}`);
      }

      return skillPaths || [];

    } catch (error) {
      console.error('Get skill paths error:', error);
      throw error;
    }
  }

  /**
   * Helper: Check if a skill is unlocked for the user
   */
  private static isSkillUnlocked(
    skill: any,
    allSkills: any[],
    progressMap: Map<string, UserSkillProgress>,
    userXP: number,
    userLevel: number
  ): boolean {
    // Check XP and level requirements
    if (userXP < skill.required_xp || userLevel < skill.required_level) {
      return false;
    }

    // Check prerequisite requirements
    if (skill.prerequisites && skill.prerequisites.length > 0) {
      for (const prereq of skill.prerequisites) {
        if (prereq.is_required) {
          const prereqSkill = allSkills.find(s => s.node_key === prereq.node_key);
          if (!prereqSkill) continue;

          const prereqProgress = progressMap.get(prereqSkill.id);
          if (!prereqProgress || (prereqProgress.status !== 'completed' && prereqProgress.status !== 'mastered')) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Helper: Get reason why skill is locked
   */
  private static getUnlockReason(
    skill: any,
    allSkills: any[],
    progressMap: Map<string, UserSkillProgress>,
    userXP: number,
    userLevel: number
  ): string {
    // Check XP requirement
    if (userXP < skill.required_xp) {
      return `Requires ${skill.required_xp} XP (you have ${userXP})`;
    }

    // Check level requirement
    if (userLevel < skill.required_level) {
      return `Requires level ${skill.required_level}`;
    }

    // Check prerequisites
    if (skill.prerequisites && skill.prerequisites.length > 0) {
      const missingPrereqs = skill.prerequisites.filter((prereq: any) => {
        if (!prereq.is_required) return false;

        const prereqSkill = allSkills.find(s => s.node_key === prereq.node_key);
        if (!prereqSkill) return false;

        const prereqProgress = progressMap.get(prereqSkill.id);
        return !prereqProgress || (prereqProgress.status !== 'completed' && prereqProgress.status !== 'mastered');
      });

      if (missingPrereqs.length > 0) {
        return `Complete: ${missingPrereqs.map((p: any) => p.title).join(', ')}`;
      }
    }

    return 'Requirements not met';
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
   * Helper: Award XP for skill completion
   */
  private static async awardSkillCompletionXP(userId: string, skillNodeId: string): Promise<void> {
    try {
      // Get skill details
      const { data: skill, error: skillError } = await supabase
        .from('skill_tree_nodes')
        .select('xp_reward, title')
        .eq('id', skillNodeId)
        .single();

      if (skillError || !skill) {
        console.error('Failed to fetch skill for XP award:', skillError);
        return;
      }

      // Import GamificationService to award XP
      const { GamificationService } = await import('./gamificationService');
      
      await GamificationService.awardXP(
        userId,
        skill.xp_reward,
        'skill_mastered',
        `Completed skill: ${skill.title}`
      );

      // Update user_skill_progress with XP earned
      await supabase
        .from('user_skill_progress')
        .update({ xp_earned: skill.xp_reward })
        .eq('user_id', userId)
        .eq('skill_node_id', skillNodeId);

    } catch (error) {
      console.error('Award skill completion XP error:', error);
    }
  }

  /**
   * Get available skill trees
   */
  static async getAvailableSkillTrees(): Promise<Array<{
    tree_path: SkillTreePath;
    title: string;
    description: string;
    total_skills: number;
    estimated_hours: number;
  }>> {
    try {
      const { data: treeSummaries, error } = await supabase
        .rpc('get_skill_tree_summaries');

      if (error) {
        throw new Error(`Failed to fetch skill tree summaries: ${error.message}`);
      }

      return treeSummaries || [];

    } catch (error) {
      console.error('Get available skill trees error:', error);
      throw error;
    }
  }
}
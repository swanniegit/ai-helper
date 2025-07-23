import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth/authService';
import { MentorService, MentorContext, MentorMessage } from '../../../../lib/mentor/mentorService';
import { GamificationService } from '../../../../lib/gamification/gamificationService';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate session
    const result = await AuthService.validateSession(sessionToken);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const { message, action = 'chat' } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user's learning context
    const context = await getUserMentorContext(result.user!.id);

    // Handle different mentor actions
    switch (action) {
      case 'chat':
        return await handleChatMessage(message, context, result.user!.id);
      case 'interview-prep':
        return await handleInterviewPrep(message, context, result.user!.id);
      case 'daily-motivation':
        return await handleDailyMotivation(context, result.user!.id);
      default:
        return await handleChatMessage(message, context, result.user!.id);
    }
  } catch (error) {
    console.error('Mentor chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getUserMentorContext(userId: string): Promise<MentorContext> {
  try {
    // Get user's latest learning path
    const { data: learningPath } = await supabase
      .from('learning_paths')
      .select(`
        *,
        skill_assessments(*),
        career_goals(*),
        learning_plans(
          *,
          plan_quarters(*)
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('progress_tracking')
      .select('notes, created_at')
      .eq('learning_path_id', learningPath?.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Calculate progress
    let completedMilestones = 0;
    let totalMilestones = 0;
    let currentQuarter = 1;

    if (learningPath?.learning_plans?.[0]?.plan_quarters) {
      const quarters = learningPath.learning_plans[0].plan_quarters;
      totalMilestones = quarters.reduce((sum: number, quarter: any) => 
        sum + (quarter.milestones?.length || 0), 0);
      
      // For now, estimate completed milestones (in real app, this would be based on actual progress)
      completedMilestones = Math.floor(totalMilestones * 0.3); // 30% progress
      currentQuarter = Math.ceil(completedMilestones / (totalMilestones / 4));
    }

    return {
      userId,
      careerPath: learningPath?.career_path,
      currentLevel: learningPath?.current_level,
      targetLevel: learningPath?.target_level,
      skills: learningPath?.skill_assessments?.map((sa: any) => ({
        name: sa.skill_name,
        level: sa.skill_level
      })) || [],
      careerGoals: learningPath?.career_goals?.map((cg: any) => cg.goal_text) || [],
      learningProgress: {
        completedMilestones,
        totalMilestones,
        currentQuarter
      },
      recentActivity: recentActivity?.map((ra: any) => ra.notes).filter(Boolean) || []
    };
  } catch (error) {
    console.error('Error getting user context:', error);
    return {
      userId,
      skills: [],
      careerGoals: [],
      learningProgress: {
        completedMilestones: 0,
        totalMilestones: 0,
        currentQuarter: 1
      },
      recentActivity: []
    };
  }
}

async function handleChatMessage(message: string, context: MentorContext, userId: string) {
  try {
    // Get conversation history
    const { data: history } = await supabase
      .from('mentor_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const conversationHistory: MentorMessage[] = history?.map((h: any) => ({
      role: h.role,
      content: h.content,
      timestamp: new Date(h.created_at)
    })) || [];

    // Generate mentor response
    const response = await MentorService.generateResponse(message, context, conversationHistory);

    // Save conversation to database
    await supabase.from('mentor_conversations').insert([
      {
        user_id: userId,
        role: 'user',
        content: message,
        context: { skillMentioned: extractSkillMentioned(message) }
      },
      {
        user_id: userId,
        role: 'assistant',
        content: response.message,
        context: { 
          skillFocus: response.skillFocus,
          confidence: response.confidence
        }
      }
    ]);

    // Award XP for mentor chat interaction
    try {
      // Update mentor chat streak
      await GamificationService.updateStreak(userId, 'mentor_chat');
      
      // Award XP for chat session
      const xpAward = await GamificationService.awardXP(userId, {
        action: 'mentor_chat_session',
        metadata: {
          message_length: message.length,
          skill_mentioned: extractSkillMentioned(message),
          career_path: context.careerPath,
          confidence_level: response.confidence,
          session_type: 'general_chat'
        },
        source_type: 'mentor_chat'
      });

      console.log(`Awarded ${xpAward.xp_amount} XP to user ${userId} for mentor chat`);
      
      // Add gamification data to response
      (response as any).gamification = {
        xp_awarded: xpAward.xp_amount,
        level_up: xpAward.level_up,
        achievements_unlocked: xpAward.achievements_unlocked,
        new_total_xp: xpAward.new_total_xp
      };
    } catch (gamificationError) {
      console.error('Gamification error during mentor chat:', gamificationError);
      // Don&apos;t fail the chat if gamification fails
    }

    return NextResponse.json({
      success: true,
      response,
      context: {
        careerPath: context.careerPath,
        currentLevel: context.currentLevel,
        targetLevel: context.targetLevel,
        progress: `${context.learningProgress.completedMilestones}/${context.learningProgress.totalMilestones}`
      }
    });
  } catch (error) {
    console.error('Chat message handling error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

async function handleInterviewPrep(message: string, context: MentorContext, userId: string) {
  try {
    // Generate interview prep response using existing mentor service
    const response = await MentorService.generateResponse(
      `Help me prepare for a ${context.careerPath} developer interview. ${message}`,
      context,
      []
    );

    // Save conversation to database
    await supabase.from('mentor_conversations').insert([
      {
        user_id: userId,
        role: 'user',
        content: message,
        context: { session_type: 'interview_prep' }
      },
      {
        user_id: userId,
        role: 'assistant',
        content: response.message,
        context: { 
          skillFocus: response.skillFocus,
          confidence: response.confidence,
          session_type: 'interview_prep'
        }
      }
    ]);

    // Award XP for interview prep session
    try {
      const xpAward = await GamificationService.awardXP(userId, {
        action: 'interview_prep_session',
        metadata: {
          career_path: context.careerPath,
          current_level: context.currentLevel,
          target_level: context.targetLevel,
          confidence_level: response.confidence,
          session_type: 'interview_prep'
        },
        source_type: 'mentor_chat'
      });

      console.log(`Awarded ${xpAward.xp_amount} XP to user ${userId} for interview prep`);
      
      // Add gamification data to response
      (response as any).gamification = {
        xp_awarded: xpAward.xp_amount,
        level_up: xpAward.level_up,
        achievements_unlocked: xpAward.achievements_unlocked,
        new_total_xp: xpAward.new_total_xp
      };
    } catch (gamificationError) {
      console.error('Gamification error during interview prep:', gamificationError);
    }

    return NextResponse.json({
      success: true,
      response,
      context: {
        careerPath: context.careerPath,
        currentLevel: context.currentLevel,
        targetLevel: context.targetLevel,
        session_type: 'interview_prep'
      }
    });
  } catch (error) {
    console.error('Interview prep error:', error);
    return NextResponse.json(
      { error: 'Failed to generate interview prep' },
      { status: 500 }
    );
  }
}



async function handleDailyMotivation(context: MentorContext, userId: string) {
  try {
    const motivation = await MentorService.generateDailyMotivation(context);

    // Save motivation session to database
    await supabase.from('mentor_conversations').insert([
      {
        user_id: userId,
        role: 'user',
        content: 'Daily motivation request',
        context: { session_type: 'daily_motivation' }
      },
      {
        user_id: userId,
        role: 'assistant',
        content: motivation.message,
        context: { 
          session_type: 'daily_motivation',
          focus_area: motivation.focusArea || 'general'
        }
      }
    ]);

    // Award XP for motivation session
    try {
      const xpAward = await GamificationService.awardXP(userId, {
        action: 'motivation_session',
        metadata: {
          career_path: context.careerPath,
          current_level: context.currentLevel,
          progress_percentage: (context.learningProgress.completedMilestones / context.learningProgress.totalMilestones) * 100,
          session_type: 'daily_motivation'
        },
        source_type: 'mentor_chat'
      });

      console.log(`Awarded ${xpAward.xp_amount} XP to user ${userId} for daily motivation`);
      
      // Add gamification data to response
      (motivation as any).gamification = {
        xp_awarded: xpAward.xp_amount,
        level_up: xpAward.level_up,
        achievements_unlocked: xpAward.achievements_unlocked,
        new_total_xp: xpAward.new_total_xp
      };
    } catch (gamificationError) {
      console.error('Gamification error during motivation session:', gamificationError);
    }

    return NextResponse.json({
      success: true,
      motivation
    });
  } catch (error) {
    console.error('Daily motivation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate motivation' },
      { status: 500 }
    );
  }
}

function extractSkillMentioned(message: string): string | undefined {
  const skillKeywords = [
    'PHP', 'Oracle', 'SQL', 'PL/SQL', 'Laravel', 'Symfony', 'JavaScript', 'React',
    'Node.js', 'Python', 'Java', 'C#', 'AWS', 'Docker', 'Kubernetes', 'Git',
    'DevOps', 'Agile', 'Scrum', 'UI/UX', 'Machine Learning', 'Data Analysis'
  ];

  for (const skill of skillKeywords) {
    if (message.toLowerCase().includes(skill.toLowerCase())) {
      return skill;
    }
  }
  return undefined;
} 
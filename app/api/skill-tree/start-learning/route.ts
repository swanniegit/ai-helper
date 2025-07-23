import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth/authService';
import { SkillTreeService } from '../../../../lib/gamification/skillTreeService';
import { StartSkillLearningRequest } from '../../../../types/gamification';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate session
    const result = await AuthService.validateSession(sessionToken);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    const body: StartSkillLearningRequest = await req.json();

    // Validate required fields
    if (!body.skill_node_id) {
      return NextResponse.json(
        { success: false, error: 'skill_node_id is required' },
        { status: 400 }
      );
    }

    // Start skill learning
    const progress = await SkillTreeService.startSkillLearning(result.user!.id, body);

    return NextResponse.json({
      success: true,
      data: progress,
      message: 'Skill learning started successfully'
    });

  } catch (error) {
    console.error('Start skill learning error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to start skill learning'
      },
      { status: 500 }
    );
  }
}
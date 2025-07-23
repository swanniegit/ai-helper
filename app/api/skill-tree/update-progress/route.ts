import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth/authService';
import { SkillTreeService } from '../../../../lib/gamification/skillTreeService';
import { UpdateSkillProgressRequest } from '../../../../types/gamification';

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

    const body: UpdateSkillProgressRequest = await req.json();

    // Validate required fields
    if (!body.skill_node_id || typeof body.progress_increment !== 'number' || !body.activity_type) {
      return NextResponse.json(
        { success: false, error: 'skill_node_id, progress_increment, and activity_type are required' },
        { status: 400 }
      );
    }

    // Validate activity type
    const validActivityTypes = ['quiz', 'mentor_session', 'resource_access'];
    if (!validActivityTypes.includes(body.activity_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid activity_type' },
        { status: 400 }
      );
    }

    // Validate progress increment
    if (body.progress_increment < 0 || body.progress_increment > 100) {
      return NextResponse.json(
        { success: false, error: 'progress_increment must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Update skill progress
    const progress = await SkillTreeService.updateSkillProgress(result.user!.id, body);

    return NextResponse.json({
      success: true,
      data: progress,
      message: 'Skill progress updated successfully'
    });

  } catch (error) {
    console.error('Update skill progress error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update skill progress'
      },
      { status: 500 }
    );
  }
}
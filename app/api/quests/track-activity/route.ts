import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth/authService';
import { QuestService } from '../../../../lib/gamification/questService';

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

    const body = await req.json();
    const { activity_type, activity_data } = body;

    if (!activity_type) {
      return NextResponse.json(
        { success: false, error: 'activity_type is required' },
        { status: 400 }
      );
    }

    // Valid activity types
    const validActivityTypes = ['quiz_completed', 'skill_completed', 'mentor_session', 'guild_joined'];
    
    if (!validActivityTypes.includes(activity_type)) {
      return NextResponse.json(
        { success: false, error: `Invalid activity_type. Must be one of: ${validActivityTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Track quest-related activity
    await QuestService.trackQuestActivity(result.user!.id, activity_type, activity_data || {});

    return NextResponse.json({
      success: true,
      message: 'Quest activity tracked successfully'
    });

  } catch (error) {
    console.error('Track quest activity error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to track quest activity'
      },
      { status: 500 }
    );
  }
}
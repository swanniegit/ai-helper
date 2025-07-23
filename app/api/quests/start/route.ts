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
    const { quest_id } = body;

    if (!quest_id) {
      return NextResponse.json(
        { success: false, error: 'quest_id is required' },
        { status: 400 }
      );
    }

    // Start the quest
    const userQuest = await QuestService.startQuest(result.user!.id, { quest_id });

    return NextResponse.json({
      success: true,
      data: userQuest,
      message: 'Quest started successfully'
    });

  } catch (error) {
    console.error('Start quest error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to start quest'
      },
      { status: 500 }
    );
  }
}
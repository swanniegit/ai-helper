import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../lib/auth/authService';
import { QuestService } from '../../../lib/gamification/questService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
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

    // Get complete quest system data for user
    const questData = await QuestService.getQuestSystemData(result.user!.id);

    return NextResponse.json({
      success: true,
      data: questData,
      message: 'Quest data retrieved successfully'
    });

  } catch (error) {
    console.error('Get quests error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch quest data'
      },
      { status: 500 }
    );
  }
}
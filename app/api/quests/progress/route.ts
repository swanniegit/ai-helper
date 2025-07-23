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
    const { user_quest_id, objective_id, progress_value } = body;

    if (!user_quest_id || !objective_id || progress_value === undefined) {
      return NextResponse.json(
        { success: false, error: 'user_quest_id, objective_id, and progress_value are required' },
        { status: 400 }
      );
    }

    // Update quest progress
    const updatedQuest = await QuestService.updateQuestProgress(result.user!.id, {
      user_quest_id,
      objective_id,
      progress_value
    });

    return NextResponse.json({
      success: true,
      data: updatedQuest,
      message: 'Quest progress updated successfully'
    });

  } catch (error) {
    console.error('Update quest progress error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update quest progress'
      },
      { status: 500 }
    );
  }
}
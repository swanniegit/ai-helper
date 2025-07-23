import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../../lib/auth/authService';
import { QuestService } from '../../../../../lib/gamification/questService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { questId: string } }
) {
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

    const { questId } = params;

    if (!questId) {
      return NextResponse.json(
        { success: false, error: 'Quest ID is required' },
        { status: 400 }
      );
    }

    // Get quest details with steps and dialogue
    const questDetails = await QuestService.getQuestDetails(questId);

    return NextResponse.json({
      success: true,
      data: questDetails,
      message: 'Quest details retrieved successfully'
    });

  } catch (error) {
    console.error('Get quest details error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch quest details'
      },
      { status: 500 }
    );
  }
}
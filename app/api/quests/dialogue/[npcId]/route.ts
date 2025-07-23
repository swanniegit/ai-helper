import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../../lib/auth/authService';
import { QuestService } from '../../../../../lib/gamification/questService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { npcId: string } }
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

    const { npcId } = params;
    const url = new URL(req.url);
    const contextType = url.searchParams.get('context') || 'general_advice';

    if (!npcId) {
      return NextResponse.json(
        { success: false, error: 'NPC ID is required' },
        { status: 400 }
      );
    }

    // Get dialogue for specific NPC and context
    const dialogue = await QuestService.getQuestDialogue(npcId, contextType, result.user!.id);

    return NextResponse.json({
      success: true,
      data: dialogue,
      message: dialogue ? 'Dialogue retrieved successfully' : 'No dialogue found'
    });

  } catch (error) {
    console.error('Get quest dialogue error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch dialogue'
      },
      { status: 500 }
    );
  }
}
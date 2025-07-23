import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../../lib/auth/authService';
import { SocialCompetitionService } from '../../../../../lib/gamification/socialCompetitionService';

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
    const { guild_id } = body;

    if (!guild_id) {
      return NextResponse.json(
        { success: false, error: 'guild_id is required' },
        { status: 400 }
      );
    }

    // Leave the guild
    await SocialCompetitionService.leaveGuild(result.user!.id, guild_id);

    return NextResponse.json({
      success: true,
      message: 'Successfully left guild'
    });

  } catch (error) {
    console.error('Leave guild error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to leave guild'
      },
      { status: 500 }
    );
  }
}
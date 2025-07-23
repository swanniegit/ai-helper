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

    // Join the guild
    const membership = await SocialCompetitionService.joinGuild(result.user!.id, guild_id);

    return NextResponse.json({
      success: true,
      data: membership,
      message: 'Successfully joined guild'
    });

  } catch (error) {
    console.error('Join guild error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to join guild'
      },
      { status: 500 }
    );
  }
}
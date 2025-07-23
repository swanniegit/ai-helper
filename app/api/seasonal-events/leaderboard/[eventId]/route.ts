import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../../lib/auth/authService';
import { SeasonalEventsService } from '../../../../../lib/gamification/seasonalEventsService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
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

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get seasonal event leaderboard
    const leaderboard = await SeasonalEventsService.getSeasonalEventLeaderboard(
      params.eventId,
      limit
    );

    return NextResponse.json({
      success: true,
      data: leaderboard
    });

  } catch (error) {
    console.error('Get seasonal event leaderboard error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get seasonal event leaderboard'
      },
      { status: 500 }
    );
  }
}
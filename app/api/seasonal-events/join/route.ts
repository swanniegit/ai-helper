import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth/authService';
import { SeasonalEventsService } from '../../../../lib/gamification/seasonalEventsService';

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
    const { event_id } = body;

    if (!event_id) {
      return NextResponse.json(
        { success: false, error: 'event_id is required' },
        { status: 400 }
      );
    }

    // Join seasonal event
    const progress = await SeasonalEventsService.joinSeasonalEvent(result.user!.id, event_id);

    return NextResponse.json({
      success: true,
      data: progress,
      message: 'Successfully joined seasonal event'
    });

  } catch (error) {
    console.error('Join seasonal event error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to join seasonal event'
      },
      { status: 500 }
    );
  }
}
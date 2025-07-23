import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth/authService';
import { GamificationService } from '../../../../lib/gamification/gamificationService';

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

    // Get user&apos;s streak data
    const progress = await GamificationService.getUserProgress(result.user!.id);

    return NextResponse.json({
      success: true,
      data: progress.streaks
    });

  } catch (error) {
    console.error('Get streaks error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get streaks'
      },
      { status: 500 }
    );
  }
}

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

    const { streak_type } = await req.json();

    if (!streak_type || !['quiz', 'mentor_chat', 'daily_activity'].includes(streak_type)) {
      return NextResponse.json(
        { success: false, error: 'Valid streak_type (quiz, mentor_chat, daily_activity) is required' },
        { status: 400 }
      );
    }

    // Update streak
    const streakUpdate = await GamificationService.updateStreak(result.user!.id, streak_type);

    return NextResponse.json({
      success: true,
      data: streakUpdate
    });

  } catch (error) {
    console.error('Update streak error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update streak'
      },
      { status: 500 }
    );
  }
}
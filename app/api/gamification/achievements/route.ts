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

    // Get user&apos;s achievements
    const progress = await GamificationService.getUserProgress(result.user!.id);

    return NextResponse.json({
      success: true,
      data: {
        earned_achievements: progress.achievements,
        available_badges: progress.available_badges,
        total_earned: progress.achievements.length,
        total_available: progress.available_badges.length + progress.achievements.length
      }
    });

  } catch (error) {
    console.error('Get achievements error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get achievements'
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

    const { action, metadata = {} } = await req.json();

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    // Check for new achievements
    const achievements = await GamificationService.checkAchievements(
      result.user!.id, 
      action, 
      metadata
    );

    return NextResponse.json({
      success: true,
      data: {
        achievements_unlocked: achievements,
        count: achievements.length
      }
    });

  } catch (error) {
    console.error('Check achievements error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check achievements'
      },
      { status: 500 }
    );
  }
}
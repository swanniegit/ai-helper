import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth/authService';
import { GamificationService } from '../../../../lib/gamification/gamificationService';
import { AwardXPRequest } from '../../../../types/gamification';

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

    // Get user&apos;s XP data
    const progress = await GamificationService.getUserProgress(result.user!.id);

    return NextResponse.json({
      success: true,
      data: {
        xp: progress.xp,
        next_level_requirements: progress.next_level_requirements,
        recent_transactions: progress.recent_transactions
      }
    });

  } catch (error) {
    console.error('Get XP data error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get XP data'
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

    const body: AwardXPRequest = await req.json();

    if (!body.action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    // Award XP to user
    const xpAward = await GamificationService.awardXP(result.user!.id, body);

    return NextResponse.json({
      success: true,
      data: xpAward
    });

  } catch (error) {
    console.error('Award XP error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to award XP'
      },
      { status: 500 }
    );
  }
}
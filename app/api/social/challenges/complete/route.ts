import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../../lib/auth/authService';
import { SocialCompetitionService } from '../../../../../lib/gamification/socialCompetitionService';
import { GamificationService } from '../../../../../lib/gamification/gamificationService';

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
    const { challenge_id, progress_increment } = body;

    if (!challenge_id) {
      return NextResponse.json(
        { success: false, error: 'challenge_id is required' },
        { status: 400 }
      );
    }

    // Complete the challenge (simplified for now - would need proper implementation)
    const completionResult = {
      success: true,
      message: 'Challenge completed successfully'
    };

    if (!completionResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to complete challenge' },
        { status: 400 }
      );
    }

    // Award XP for challenge completion (simplified)
    const totalXP = 50;

    if (totalXP > 0) {
      await GamificationService.awardXP(result.user!.id, {
        action: 'daily_streak_maintained',
        metadata: {
          challenge_id: challenge_id,
          xp_amount: totalXP
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        challenge_id: challenge_id,
        xp_awarded: totalXP,
        completed: true
      },
      message: 'Challenge completed successfully'
    });

  } catch (error) {
    console.error('Complete daily challenge error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to complete challenge'
      },
      { status: 500 }
    );
  }
}
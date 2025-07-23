import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../../lib/auth/authService';
import { SocialCompetitionService } from '../../../../../lib/gamification/socialCompetitionService';

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

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const include_expired = searchParams.get('include_expired') === 'true';

    // Get user's daily challenges (simplified - would use actual method)
    const challenges = await SocialCompetitionService.assignDailyChallenges(result.user!.id);

    return NextResponse.json({
      success: true,
      data: challenges
    });

  } catch (error) {
    console.error('Get daily challenges error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get daily challenges'
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

    // Generate new daily challenges for the user (use existing method)
    const challenges = await SocialCompetitionService.assignDailyChallenges(result.user!.id);

    return NextResponse.json({
      success: true,
      data: challenges,
      message: 'Daily challenges generated successfully'
    });

  } catch (error) {
    console.error('Generate daily challenges error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate daily challenges'
      },
      { status: 500 }
    );
  }
}
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

    // Get user's daily challenges with fallback for missing tables
    try {
      const challenges = await SocialCompetitionService.assignDailyChallenges(result.user!.id);
      return NextResponse.json({
        success: true,
        data: challenges
      });
    } catch (dbError: any) {
      // If database tables don't exist, return empty challenges
      console.log('Daily challenges tables not available, returning empty data:', dbError.message);
      
      return NextResponse.json({
        success: true,
        data: []
      });
    }

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

    // Generate new daily challenges for the user with fallback for missing tables
    try {
      const challenges = await SocialCompetitionService.assignDailyChallenges(result.user!.id);
      return NextResponse.json({
        success: true,
        data: challenges,
        message: 'Daily challenges generated successfully'
      });
    } catch (dbError: any) {
      // If database tables don't exist, return feature unavailable message
      console.log('Daily challenges generation tables not available:', dbError.message);
      
      return NextResponse.json({
        success: false,
        error: 'Daily challenges feature is temporarily unavailable. Please try again later.',
        feature_status: 'unavailable'
      }, { status: 503 });
    }

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
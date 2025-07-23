import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth/authService';
import { SocialCompetitionService } from '../../../../lib/gamification/socialCompetitionService';
import { SkillCategory, LeaderboardPeriod } from '../../../../types/gamification';

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
    const skillCategory = searchParams.get('skill_category') as SkillCategory;
    const timePeriod = searchParams.get('time_period') as LeaderboardPeriod;
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!skillCategory || !timePeriod) {
      return NextResponse.json(
        { success: false, error: 'skill_category and time_period are required' },
        { status: 400 }
      );
    }

    // Validate parameters
    const validSkillCategories: SkillCategory[] = ['PHP', 'Oracle', 'General', 'Database', 'Web Development'];
    const validTimePeriods: LeaderboardPeriod[] = ['daily', 'weekly', 'monthly', 'all_time'];

    if (!validSkillCategories.includes(skillCategory)) {
      return NextResponse.json(
        { success: false, error: 'Invalid skill_category' },
        { status: 400 }
      );
    }

    if (!validTimePeriods.includes(timePeriod)) {
      return NextResponse.json(
        { success: false, error: 'Invalid time_period' },
        { status: 400 }
      );
    }

    // Get leaderboard data
    const leaderboardData = await SocialCompetitionService.getLeaderboard(
      skillCategory,
      timePeriod,
      result.user!.id,
      limit
    );

    return NextResponse.json({
      success: true,
      data: leaderboardData
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get leaderboard data'
      },
      { status: 500 }
    );
  }
}
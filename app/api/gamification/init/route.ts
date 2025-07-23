import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth/authService';
import { GamificationService } from '../../../../lib/gamification/gamificationService';

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

    // Initialize gamification for user
    await GamificationService.initializeUser(result.user!.id);

    // Get initial progress data
    const progress = await GamificationService.getUserProgress(result.user!.id);

    return NextResponse.json({
      success: true,
      message: 'Gamification initialized successfully',
      data: progress
    });

  } catch (error) {
    console.error('Initialize gamification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to initialize gamification'
      },
      { status: 500 }
    );
  }
}
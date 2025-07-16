import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '../../../../lib/quiz/quizService';
import { AuthService } from '../../../../lib/auth/authService';

export async function GET(req: NextRequest) {
  try {
    // Get session token from cookies
    const sessionToken = req.cookies.get('session_token')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate session
    const authResult = await AuthService.validateSession(sessionToken);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get user progress
    const progress = await QuizService.getUserProgress(authResult.user.id);

    return NextResponse.json({
      success: true,
      data: progress
    });

  } catch (error: any) {
    console.error('Get quiz progress error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to get quiz progress',
        success: false 
      },
      { status: 500 }
    );
  }
} 
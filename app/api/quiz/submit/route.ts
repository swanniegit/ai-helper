import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '../../../../lib/quiz/quizService';
import { AuthService } from '../../../../lib/auth/authService';
import { SubmitQuizRequest } from '../../../../types/quiz';

export async function POST(req: NextRequest) {
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

    // Parse request body
    const body: SubmitQuizRequest = await req.json();
    
    // Validate required fields
    if (!body.session_token) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      );
    }

    if (!body.answers || !Array.isArray(body.answers)) {
      return NextResponse.json(
        { error: 'Answers array is required' },
        { status: 400 }
      );
    }

    if (typeof body.time_taken_seconds !== 'number' || body.time_taken_seconds < 0) {
      return NextResponse.json(
        { error: 'Valid time taken is required' },
        { status: 400 }
      );
    }

    // Submit quiz
    const result = await QuizService.submitQuiz(body, authResult.user.id);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Quiz submission error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to submit quiz',
        success: false 
      },
      { status: 500 }
    );
  }
} 
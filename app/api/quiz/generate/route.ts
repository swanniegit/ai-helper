import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '../../../../lib/quiz/quizService';
import { AuthService } from '../../../../lib/auth/authService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { GenerateQuizRequest } from '../../../../types/quiz';

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
    const body: GenerateQuizRequest = await req.json();
    
    // Validate required fields
    if (!body.skill_category) {
      return NextResponse.json(
        { error: 'Skill category is required' },
        { status: 400 }
      );
    }

    // Generate quiz
    const quizData = await QuizService.generateQuiz(body, authResult.user.id);

    return NextResponse.json({
      success: true,
      data: quizData
    });

  } catch (error: any) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate quiz',
        success: false 
      },
      { status: 500 }
    );
  }
} 
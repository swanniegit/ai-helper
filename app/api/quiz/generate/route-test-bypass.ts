import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '../../../../lib/quiz/quizService';
import { AuthService } from '../../../../lib/auth/authService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { GenerateQuizRequest } from '../../../../types/quiz';

export async function POST(req: NextRequest) {
  try {
    // TEMPORARY: Bypass authentication for testing
    // Remove this when you have working authentication
    const BYPASS_AUTH = process.env.NODE_ENV === 'development' && process.env.BYPASS_QUIZ_AUTH === 'true';
    
    let userId: string;
    
    if (BYPASS_AUTH) {
      // Use a test user ID - you can create this user in your database
      userId = 'test-user-id-12345';
      console.log('⚠️ BYPASSING AUTHENTICATION FOR TESTING - userId:', userId);
    } else {
      // Normal authentication flow
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
      
      userId = authResult.user.id;
    }

    // Parse request body
    const body: any = await req.json();
    
    // Validate required fields - either skill_category OR template_id is required
    if (!body.skill_category && !body.template_id) {
      return NextResponse.json(
        { error: 'Either skill_category or template_id is required' },
        { status: 400 }
      );
    }

    // Generate quiz
    const quizData = await QuizService.generateQuiz(body, userId);

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
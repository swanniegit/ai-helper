import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '../../../../lib/quiz/quizService';
import { AuthService } from '../../../../lib/auth/authService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const skillCategory = searchParams.get('skill_category');

    // Get quiz templates
    const templates = await QuizService.getQuizTemplates(skillCategory || undefined);

    return NextResponse.json({
      success: true,
      data: templates
    });

  } catch (error: any) {
    console.error('Get quiz templates error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to get quiz templates',
        success: false 
      },
      { status: 500 }
    );
  }
} 
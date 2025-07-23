import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '../../../../lib/quiz/quizService';
import { AuthService } from '../../../../lib/auth/authService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const skillCategory = searchParams.get('skill_category');

    // Get quiz templates (no authentication required for browsing templates)
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
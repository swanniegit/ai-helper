import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '../../../../lib/quiz/quizService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    console.log('Testing quiz generation endpoint...');
    
    // Parse request body
    const body: any = await req.json();
    console.log('Request body:', body);
    
    // Validate required fields - either skill_category OR template_id is required
    if (!body.skill_category && !body.template_id) {
      return NextResponse.json(
        { error: 'Either skill_category or template_id is required' },
        { status: 400 }
      );
    }

    // Use test user ID for testing
    const testUserId = 'test-user-12345';
    console.log('Using test user ID:', testUserId);

    // Generate quiz
    const quizData = await QuizService.generateQuiz(body, testUserId);
    console.log('Quiz generated successfully:', {
      sessionToken: quizData.session_token,
      questionCount: quizData.questions.length,
      template: quizData.template.name
    });

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
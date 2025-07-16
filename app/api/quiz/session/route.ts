import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth/authService';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Quiz session token is required' },
        { status: 400 }
      );
    }

    // Get quiz session from database
    const { data: session, error } = await supabase
      .from('quiz_sessions')
      .select(`
        *,
        quiz_templates (
          id,
          name,
          description,
          quiz_type,
          skill_category,
          difficulty_level,
          question_count,
          time_limit_minutes,
          passing_score
        )
      `)
      .eq('session_token', token)
      .eq('user_id', authResult.user.id)
      .eq('is_active', true)
      .single();

    if (error || !session) {
      return NextResponse.json(
        { error: 'Quiz session not found or expired' },
        { status: 404 }
      );
    }

    // Check if session has expired
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Quiz session has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session
    });

  } catch (error: any) {
    console.error('Get quiz session error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to get quiz session',
        success: false 
      },
      { status: 500 }
    );
  }
} 
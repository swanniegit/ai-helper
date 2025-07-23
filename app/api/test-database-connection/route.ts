import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase environment variables',
        details: {
          url: supabaseUrl ? 'Set' : 'Missing',
          key: supabaseKey ? 'Set' : 'Missing'
        }
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);

    if (connectionError) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionError.message,
        tables: {
          users: 'Error connecting'
        }
      }, { status: 500 });
    }

    // Test if key tables exist
    const tablesToTest = [
      'users',
      'user_sessions',
      'quiz_templates',
      'quiz_results',
      'leaderboards',
      'guilds',
      'user_daily_challenges',
      'badge_definitions',
      'user_xp',
      'seasonal_events',
      'user_seasonal_progress'
    ];

    const tableStatus: Record<string, string> = {};

    for (const table of tablesToTest) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count(*)')
          .limit(1);
        
        tableStatus[table] = error ? `Error: ${error.message}` : 'Exists';
      } catch (err) {
        tableStatus[table] = `Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      environment: {
        supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
        supabaseKey: supabaseKey ? 'Set' : 'Missing',
        openaiKey: process.env.OPENAI_API_KEY ? 'Set' : 'Missing',
        jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Missing'
      },
      tables: tableStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database connection test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
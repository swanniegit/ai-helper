import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(req: NextRequest) {
  try {
    // Test 1: Check if user_sessions table exists and has correct schema
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_sessions')
      .select('*')
      .limit(1);

    if (tableError) {
      return NextResponse.json({
        error: 'Table access error',
        details: tableError
      }, { status: 500 });
    }

    // Test 2: Try to insert a test session
    const testUserId = uuidv4();
    const testSessionToken = 'test-session-token-' + Date.now();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const { data: insertResult, error: insertError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: testUserId,
        session_token: testSessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: '127.0.0.1',
        user_agent: 'test-agent',
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({
        error: 'Session insert error',
        details: insertError,
        tableInfo
      }, { status: 500 });
    }

    // Test 3: Clean up test data
    await supabase
      .from('user_sessions')
      .delete()
      .eq('session_token', testSessionToken);

    return NextResponse.json({
      success: true,
      message: 'Session creation test passed',
      tableInfo,
      insertResult
    });

  } catch (error) {
    console.error('Session test error:', error);
    return NextResponse.json({
      error: 'Session test failed',
      details: error
    }, { status: 500 });
  }
} 
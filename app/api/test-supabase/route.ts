import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(req: NextRequest) {
  try {
    // Test basic connection by trying to query the users table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      data: data,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
    });
  } catch (error: any) {
    console.error('Test connection error:', error);
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error.message
    }, { status: 500 });
  }
} 
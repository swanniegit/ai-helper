import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('Testing quiz tables...');
    
    // Use service role key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'missing',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'missing'
    );

    const tables = ['quiz_sessions', 'quiz_templates', 'quiz_results'];
    const results: any = {};

    for (const table of tables) {
      try {
        console.log(`Testing table: ${table}`);
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1);

        if (error) {
          results[table] = { error: error.message, exists: false };
        } else {
          results[table] = { 
            exists: true, 
            count: count || 0,
            sample: data?.[0] ? 'has_data' : 'empty'
          };
        }
      } catch (tableError: any) {
        results[table] = { error: tableError.message, exists: false };
      }
    }

    // Test user creation
    try {
      const testUserId = '550e8400-e29b-41d4-a716-446655440000';
      console.log('Testing user creation...');
      
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: testUserId,
          email: 'test@example.com',
          password_hash: 'test-hash',
          first_name: 'Test',
          last_name: 'User',
          created_at: new Date().toISOString()
        });

      results.test_user = userError ? { error: userError.message } : { created: true };
    } catch (userCreateError: any) {
      results.test_user = { error: userCreateError.message };
    }

    return NextResponse.json({
      success: true,
      message: 'Quiz tables test completed',
      results
    });

  } catch (error: any) {
    console.error('Quiz tables test error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Quiz tables test failed',
        success: false 
      },
      { status: 500 }
    );
  }
}
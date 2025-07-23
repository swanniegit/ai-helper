import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
);

export async function POST(req: NextRequest) {
  try {
    console.log('=== Testing Password Hashing and Comparison ===');
    
    const testPassword = 'TestPassword123!';
    const testEmail = `debug_${Date.now()}@example.com`;
    
    console.log('Step 1: Testing bcrypt functionality...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(testPassword, saltRounds);
    console.log('Password hashed successfully, length:', hashedPassword.length);
    
    const compareResult = await bcrypt.compare(testPassword, hashedPassword);
    console.log('Password comparison result:', compareResult);
    
    if (!compareResult) {
      return NextResponse.json({
        success: false,
        error: 'bcrypt comparison failed for freshly hashed password',
        debug: {
          password_length: testPassword.length,
          hash_length: hashedPassword.length,
          hash_starts_with: hashedPassword.substring(0, 10)
        }
      }, { status: 500 });
    }
    
    console.log('Step 2: Create user in database...');
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert({
        email: testEmail,
        password_hash: hashedPassword,
        first_name: 'Debug',
        last_name: 'Test'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to insert user',
        details: insertError.message
      }, { status: 500 });
    }
    
    console.log('User created successfully:', user.id);
    
    console.log('Step 3: Retrieve user and test password...');
    const { data: retrievedUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .eq('is_active', true)
      .single();
    
    if (selectError || !retrievedUser) {
      console.error('Select error:', selectError);
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve user',
        details: selectError?.message
      }, { status: 500 });
    }
    
    console.log('User retrieved successfully');
    console.log('Password hash from DB matches inserted hash:', retrievedUser.password_hash === hashedPassword);
    
    const dbCompareResult = await bcrypt.compare(testPassword, retrievedUser.password_hash);
    console.log('Password comparison with DB hash result:', dbCompareResult);
    
    return NextResponse.json({
      success: true,
      message: 'Password debug test completed',
      test_results: {
        bcrypt_basic_test: {
          hash_created: true,
          comparison_success: compareResult
        },
        database_test: {
          user_created: true,
          user_retrieved: true,
          hash_matches: retrievedUser.password_hash === hashedPassword,
          password_comparison_success: dbCompareResult
        },
        debug_info: {
          password_length: testPassword.length,
          hash_length: retrievedUser.password_hash.length,
          hash_preview: retrievedUser.password_hash.substring(0, 20) + '...'
        }
      }
    });

  } catch (error: any) {
    console.error('=== Password Debug Test Failed ===');
    console.error('Error:', error.message);
    
    return NextResponse.json(
      { 
        error: error.message || 'Password debug test failed',
        success: false,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
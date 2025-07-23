import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
);

export async function POST(req: NextRequest) {
  try {
    console.log('=== Detailed Login Debug Test ===');
    
    const testEmail = `login_debug_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    // Step 1: Create user (replicating AuthService.register logic)
    console.log('Step 1: Creating user...');
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(testPassword, saltRounds);
    
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert({
        email: testEmail,
        password_hash: passwordHash,
        first_name: 'Debug',
        last_name: 'User',
        email_verification_token: uuidv4()
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ User creation failed:', insertError);
      return NextResponse.json({
        success: false,
        error: 'User creation failed',
        details: insertError.message
      }, { status: 500 });
    }
    
    console.log('✅ User created:', user.id);
    
    // Step 2: Replicate exact AuthService.login logic with detailed logging
    console.log('Step 2: Attempting login with exact AuthService logic...');
    
    console.log('2.1: Finding user by email...');
    const { data: loginUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .eq('is_active', true)
      .single();
    
    console.log('Select query result:', {
      hasData: !!loginUser,
      hasError: !!selectError,
      errorDetails: selectError?.message
    });
    
    if (selectError || !loginUser) {
      console.error('❌ User not found:', selectError?.message || 'No user data');
      return NextResponse.json({
        success: false,
        error: 'User not found during login',
        debug: {
          select_error: selectError?.message,
          has_user: !!loginUser
        }
      }, { status: 500 });
    }
    
    console.log('✅ User found:', loginUser.id);
    
    console.log('2.2: Verifying password...');
    console.log('Password comparison input:', {
      provided_password_length: testPassword.length,
      stored_hash_length: loginUser.password_hash.length,
      hash_starts_with: loginUser.password_hash.substring(0, 10)
    });
    
    const isValidPassword = await bcrypt.compare(testPassword, loginUser.password_hash);
    console.log('Password comparison result:', isValidPassword);
    
    if (!isValidPassword) {
      console.error('❌ Password comparison failed');
      return NextResponse.json({
        success: false,
        error: 'Password comparison failed',
        debug: {
          provided_password: testPassword,
          stored_hash_preview: loginUser.password_hash.substring(0, 20) + '...'
        }
      }, { status: 500 });
    }
    
    console.log('✅ Password verified');
    
    console.log('2.3: Updating last login...');
    const { error: updateError } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', loginUser.id);
    
    if (updateError) {
      console.warn('⚠️ Last login update failed:', updateError.message);
    } else {
      console.log('✅ Last login updated');
    }
    
    console.log('2.4: Creating session...');
    const sessionId = uuidv4().replace(/-/g, '').substring(0, 16);
    const timestamp = Date.now().toString(36);
    const sessionToken = `${loginUser.id}_${sessionId}_${timestamp}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: loginUser.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: '127.0.0.1', // Valid IP address format
        user_agent: 'test-user-agent',
        is_active: true
      })
      .select()
      .single();
    
    if (sessionError) {
      console.error('❌ Session creation failed:', sessionError);
      return NextResponse.json({
        success: false,
        error: 'Session creation failed',
        details: sessionError.message
      }, { status: 500 });
    }
    
    console.log('✅ Session created:', session.id);
    
    console.log('=== Login Debug Test Completed Successfully ===');
    
    return NextResponse.json({
      success: true,
      message: 'Detailed login debug test passed - all steps working correctly!',
      test_results: {
        user_creation: {
          success: true,
          user_id: user.id
        },
        user_lookup: {
          success: true,
          found_user: true,
          user_id: loginUser.id
        },
        password_verification: {
          success: true,
          passwords_match: isValidPassword
        },
        last_login_update: {
          success: !updateError,
          error: updateError?.message
        },
        session_creation: {
          success: true,
          session_id: session.id,
          session_token_length: sessionToken.length
        }
      }
    });

  } catch (error: any) {
    console.error('=== Login Debug Test Failed ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: error.message || 'Login debug test failed',
        success: false,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
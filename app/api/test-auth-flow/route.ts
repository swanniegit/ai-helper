import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../lib/auth/authService';

export async function POST(req: NextRequest) {
  try {
    console.log('=== Testing Authentication Flow ===');
    
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    const testFirstName = 'Test';
    const testLastName = 'User';
    
    console.log('Step 1: Testing user registration...');
    const registerResult = await AuthService.register(testEmail, testPassword, testFirstName, testLastName);
    
    if (!registerResult.success) {
      console.error('❌ Registration failed:', registerResult.error);
      return NextResponse.json({
        success: false,
        error: 'Registration failed',
        details: registerResult.error,
        test_stage: 'registration'
      }, { status: 500 });
    }
    
    console.log('✅ Registration successful:', {
      user_id: registerResult.user?.id,
      email: registerResult.user?.email,
      has_session: !!registerResult.session
    });

    console.log('Step 2: Testing session validation...');
    const sessionToken = registerResult.session?.session_token;
    if (!sessionToken) {
      throw new Error('No session token returned from registration');
    }
    
    const validateResult = await AuthService.validateSession(sessionToken);
    if (!validateResult.success) {
      console.error('❌ Session validation failed:', validateResult.error);
      return NextResponse.json({
        success: false,
        error: 'Session validation failed',
        details: validateResult.error,
        test_stage: 'session_validation'
      }, { status: 500 });
    }
    
    console.log('✅ Session validation successful:', {
      validated_user: validateResult.user?.email,
      session_valid: validateResult.success
    });

    console.log('Step 3: Testing login...');
    // First logout to clear session (logout takes userId, not sessionToken)
    const preLoginLogoutResult = await AuthService.logout(registerResult.user!.id);
    console.log('Pre-login logout result:', preLoginLogoutResult);
    
    // Small delay to ensure database consistency
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const loginResult = await AuthService.login(testEmail, testPassword, 'test-ip', 'test-user-agent');
    console.log('Login attempt result:', { 
      success: loginResult.success, 
      error: loginResult.error,
      hasUser: !!loginResult.user,
      hasSession: !!loginResult.session 
    });
    
    if (!loginResult.success) {
      console.error('❌ Login failed:', loginResult.error);
      // Let's also check if the user still exists in the database
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
      );
      
      const { data: userCheck, error: userCheckError } = await supabase
        .from('users')
        .select('id, email, is_active')
        .eq('email', testEmail)
        .single();
      
      console.log('User existence check:', { userCheck, userCheckError });
      
      return NextResponse.json({
        success: false,
        error: 'Login failed',
        details: loginResult.error,
        test_stage: 'login',
        debug: {
          user_exists: !!userCheck,
          user_data: userCheck,
          check_error: userCheckError?.message
        }
      }, { status: 500 });
    }
    
    console.log('✅ Login successful:', {
      user_id: loginResult.user?.id,
      email: loginResult.user?.email,
      has_new_session: !!loginResult.session
    });

    console.log('Step 4: Testing logout...');
    const newSessionToken = loginResult.session?.session_token;
    if (!newSessionToken) {
      throw new Error('No session token returned from login');
    }
    
    const logoutResult = await AuthService.logout(loginResult.user!.id);
    if (!logoutResult) {
      console.error('❌ Logout failed');
      return NextResponse.json({
        success: false,
        error: 'Logout failed',
        test_stage: 'logout'
      }, { status: 500 });
    }
    
    console.log('✅ Logout successful');

    console.log('Step 5: Testing session validation after logout...');
    const postLogoutValidation = await AuthService.validateSession(newSessionToken);
    if (postLogoutValidation.success) {
      console.error('❌ Session should be invalid after logout but still validates');
      return NextResponse.json({
        success: false,
        error: 'Session still valid after logout',
        test_stage: 'post_logout_validation'
      }, { status: 500 });
    }
    
    console.log('✅ Session correctly invalidated after logout');

    console.log('=== Authentication Flow Test Completed Successfully ===');

    return NextResponse.json({
      success: true,
      message: 'Complete authentication flow test passed!',
      test_results: {
        registration: {
          success: true,
          user_id: registerResult.user?.id,
          email: registerResult.user?.email
        },
        session_validation: {
          success: true,
          user_matched: validateResult.user?.id === registerResult.user?.id
        },
        login: {
          success: true,
          user_id: loginResult.user?.id,
          email: loginResult.user?.email
        },
        logout: {
          success: true
        },
        post_logout_validation: {
          success: true,
          correctly_invalidated: !postLogoutValidation.success
        }
      }
    });

  } catch (error: any) {
    console.error('=== Authentication Flow Test Failed ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: error.message || 'Authentication flow test failed',
        success: false,
        test_stage: 'unknown',
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
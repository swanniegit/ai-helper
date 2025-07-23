import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../lib/auth/authService';

export async function POST(req: NextRequest) {
  try {
    console.log('=== Testing Simple Auth Flow ===');
    
    const testEmail = `simple_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    const testFirstName = 'Simple';
    const testLastName = 'Test';
    
    console.log('Step 1: Register user...');
    const registerResult = await AuthService.register(testEmail, testPassword, testFirstName, testLastName);
    
    if (!registerResult.success) {
      console.error('❌ Registration failed:', registerResult.error);
      return NextResponse.json({
        success: false,
        error: 'Registration failed',
        details: registerResult.error
      }, { status: 500 });
    }
    
    console.log('✅ Registration successful');

    console.log('Step 2: Immediate login with same credentials...');
    const loginResult = await AuthService.login(testEmail, testPassword, 'test-ip', 'test-user-agent');
    
    if (!loginResult.success) {
      console.error('❌ Login failed:', loginResult.error);
      return NextResponse.json({
        success: false,
        error: 'Login failed immediately after registration',
        details: loginResult.error,
        debug: {
          registered_email: testEmail,
          login_attempted_email: testEmail,
          passwords_match: true // We're using the same password
        }
      }, { status: 500 });
    }
    
    console.log('✅ Login successful immediately after registration');

    return NextResponse.json({
      success: true,
      message: 'Simple auth test passed - register and immediate login work',
      test_results: {
        registration: {
          success: true,
          user_id: registerResult.user?.id,
          email: registerResult.user?.email
        },
        immediate_login: {
          success: true,
          user_id: loginResult.user?.id,
          email: loginResult.user?.email,
          same_user: registerResult.user?.id === loginResult.user?.id
        }
      }
    });

  } catch (error: any) {
    console.error('=== Simple Auth Test Failed ===');
    console.error('Error:', error.message);
    
    return NextResponse.json(
      { 
        error: error.message || 'Simple auth test failed',
        success: false
      },
      { status: 500 }
    );
  }
}
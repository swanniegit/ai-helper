import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../lib/auth/authService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('session_token')?.value;

    return NextResponse.json({
      success: true,
      hasSessionToken: !!sessionToken,
      sessionTokenLength: sessionToken?.length || 0,
      cookies: Object.fromEntries(req.cookies.entries()),
      message: sessionToken ? 'User has session token' : 'No session token found - user needs to login'
    });
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Test login
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const result = await AuthService.login(email, password, ipAddress, userAgent);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Login failed'
      });
    }

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user!.id,
        email: result.user!.email,
        first_name: result.user!.first_name,
        last_name: result.user!.last_name
      },
      message: 'Login successful'
    });

    // Set secure session cookie
    response.cookies.set('session_token', result.session!.session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Test auth POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
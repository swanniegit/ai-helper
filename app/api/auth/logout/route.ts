import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth/authService';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('session_token')?.value;

    if (sessionToken) {
      // Validate session to get user ID
      const result = await AuthService.validateSession(sessionToken);
      
      if (result.success && result.user) {
        // Logout user (invalidate all sessions)
        await AuthService.logout(result.user.id);
      }

      // Invalidate specific session
      await AuthService.invalidateSession(sessionToken);
    }

    // Clear session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
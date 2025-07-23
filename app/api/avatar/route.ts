import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../lib/auth/authService';
import { AvatarService } from '../../../lib/gamification/avatarService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate session
    const result = await AuthService.validateSession(sessionToken);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get user's complete avatar data
    const avatarData = await AvatarService.getUserAvatar(result.user!.id);

    return NextResponse.json({
      success: true,
      data: avatarData
    });

  } catch (error) {
    console.error('Get avatar error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get avatar data'
      },
      { status: 500 }
    );
  }
}
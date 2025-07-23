import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth/authService';
import { AvatarService } from '../../../../lib/gamification/avatarService';
import { CustomizeAvatarRequest } from '../../../../types/gamification';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
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

    const body: CustomizeAvatarRequest = await req.json();

    // Validate request
    if (!body.customization && !body.avatar_name) {
      return NextResponse.json(
        { success: false, error: 'customization or avatar_name is required' },
        { status: 400 }
      );
    }

    // Customize avatar
    const updatedAvatar = await AvatarService.customizeAvatar(result.user!.id, body);

    return NextResponse.json({
      success: true,
      data: updatedAvatar,
      message: 'Avatar customized successfully'
    });

  } catch (error) {
    console.error('Customize avatar error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to customize avatar'
      },
      { status: 500 }
    );
  }
}
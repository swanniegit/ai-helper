import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth/authService';
import { AvatarService } from '../../../../lib/gamification/avatarService';

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

    const body = await req.json();
    const { preset_key } = body;

    if (!preset_key) {
      return NextResponse.json(
        { success: false, error: 'preset_key is required' },
        { status: 400 }
      );
    }

    // Apply avatar preset
    const updatedAvatar = await AvatarService.applyAvatarPreset(result.user!.id, preset_key);

    return NextResponse.json({
      success: true,
      data: updatedAvatar,
      message: 'Avatar preset applied successfully'
    });

  } catch (error) {
    console.error('Apply avatar preset error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to apply avatar preset'
      },
      { status: 500 }
    );
  }
}
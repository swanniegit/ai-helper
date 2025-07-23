import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth/authService';
import { SkillTreeService } from '../../../../lib/gamification/skillTreeService';
import { SkillTreePath } from '../../../../types/gamification';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string } }
) {
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

    const treePath = params.path as SkillTreePath;

    // Validate tree path
    const validPaths: SkillTreePath[] = ['php', 'oracle', 'general', 'full_stack'];
    if (!validPaths.includes(treePath)) {
      return NextResponse.json(
        { success: false, error: 'Invalid skill tree path' },
        { status: 400 }
      );
    }

    // Get skill tree visualization data
    const skillTreeData = await SkillTreeService.getSkillTreeVisualization(
      result.user!.id,
      treePath
    );

    return NextResponse.json({
      success: true,
      data: skillTreeData
    });

  } catch (error) {
    console.error('Get skill tree error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get skill tree data'
      },
      { status: 500 }
    );
  }
}
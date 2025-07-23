import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth/authService';
import { SkillTreeService } from '../../../../lib/gamification/skillTreeService';
import { ChooseSkillPathRequest } from '../../../../types/gamification';

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

    // Get user's skill paths
    const skillPaths = await SkillTreeService.getUserSkillPaths(result.user!.id);

    // Get available skill trees
    const availableTrees = await SkillTreeService.getAvailableSkillTrees();

    return NextResponse.json({
      success: true,
      data: {
        user_paths: skillPaths,
        available_trees: availableTrees
      }
    });

  } catch (error) {
    console.error('Get skill paths error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get skill paths'
      },
      { status: 500 }
    );
  }
}

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

    const body: ChooseSkillPathRequest = await req.json();

    // Validate required fields
    if (!body.path_name || typeof body.is_primary !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'path_name and is_primary are required' },
        { status: 400 }
      );
    }

    // Validate path name
    const validPaths = ['php', 'oracle', 'general', 'full_stack'];
    if (!validPaths.includes(body.path_name)) {
      return NextResponse.json(
        { success: false, error: 'Invalid path_name' },
        { status: 400 }
      );
    }

    // Choose skill path
    const skillPath = await SkillTreeService.chooseSkillPath(result.user!.id, body);

    return NextResponse.json({
      success: true,
      data: skillPath,
      message: 'Skill path chosen successfully'
    });

  } catch (error) {
    console.error('Choose skill path error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to choose skill path'
      },
      { status: 500 }
    );
  }
}
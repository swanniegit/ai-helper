import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/auth/authService';
import { SocialCompetitionService } from '../../../../lib/gamification/socialCompetitionService';
import { CreateGuildRequest } from '../../../../types/gamification';

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

    // Get user&apos;s guilds and recommended guilds
    const guildData = await SocialCompetitionService.getUserGuilds(result.user!.id);

    return NextResponse.json({
      success: true,
      data: guildData
    });

  } catch (error) {
    console.error('Get guilds error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get guild data'
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

    const body: CreateGuildRequest = await req.json();

    // Validate required fields
    if (!body.name || !body.display_name || !body.skill_focus || !body.guild_type) {
      return NextResponse.json(
        { success: false, error: 'name, display_name, skill_focus, and guild_type are required' },
        { status: 400 }
      );
    }

    // Validate enum values
    const validSkillFocus = ['php', 'oracle', 'general', 'full_stack'];
    const validGuildTypes = ['study_squad', 'skill_guild', 'mentor_circle'];

    if (!validSkillFocus.includes(body.skill_focus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid skill_focus' },
        { status: 400 }
      );
    }

    if (!validGuildTypes.includes(body.guild_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid guild_type' },
        { status: 400 }
      );
    }

    // Create guild
    const guild = await SocialCompetitionService.createGuild(result.user!.id, body);

    return NextResponse.json({
      success: true,
      data: guild,
      message: 'Guild created successfully'
    });

  } catch (error) {
    console.error('Create guild error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create guild'
      },
      { status: 500 }
    );
  }
}
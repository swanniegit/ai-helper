import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../lib/auth/authService';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface LearningPathData {
  title: string;
  description?: string;
  career_path?: 'PHP' | 'Oracle';
  current_level?: 'Junior' | 'Intermediate' | 'Senior';
  target_level?: 'Junior' | 'Intermediate' | 'Senior';
  timeline_months: number;
  skills: string[];
  skill_levels: Record<string, 'beginner' | 'intermediate' | 'advanced'>;
  career_goals: string[];
  priority_areas: string[];
  generated_plan?: any;
}

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate session
    const result = await AuthService.validateSession(sessionToken);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get user's learning paths
    const { data: learningPaths, error } = await supabase
      .from('learning_paths')
      .select(`
        *,
        skill_assessments(*),
        career_goals(*),
        priority_areas(*),
        learning_plans(
          *,
          plan_quarters(*)
        )
      `)
      .eq('user_id', result.user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching learning paths:', error);
      return NextResponse.json(
        { error: 'Failed to fetch learning paths' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      learning_paths: learningPaths
    });
  } catch (error) {
    console.error('Get learning paths error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate session
    const result = await AuthService.validateSession(sessionToken);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const data: LearningPathData = await req.json();

    // Validation
    if (!data.title || !data.timeline_months) {
      return NextResponse.json(
        { error: 'Title and timeline are required' },
        { status: 400 }
      );
    }

    // Create learning path
    const { data: learningPath, error: pathError } = await supabase
      .from('learning_paths')
      .insert({
        user_id: result.user!.id,
        title: data.title,
        description: data.description,
        career_path: data.career_path,
        current_level: data.current_level,
        target_level: data.target_level,
        timeline_months: data.timeline_months
      })
      .select()
      .single();

    if (pathError) {
      console.error('Error creating learning path:', pathError);
      return NextResponse.json(
        { error: 'Failed to create learning path' },
        { status: 500 }
      );
    }

    // Create skill assessments
    if (data.skills && data.skills.length > 0) {
      const skillAssessments = data.skills.map(skill => ({
        learning_path_id: learningPath.id,
        skill_name: skill,
        skill_level: data.skill_levels[skill] || 'beginner'
      }));

      const { error: skillsError } = await supabase
        .from('skill_assessments')
        .insert(skillAssessments);

      if (skillsError) {
        console.error('Error creating skill assessments:', skillsError);
      }
    }

    // Create career goals
    if (data.career_goals && data.career_goals.length > 0) {
      const careerGoals = data.career_goals.map((goal, index) => ({
        learning_path_id: learningPath.id,
        goal_text: goal,
        priority: index + 1
      }));

      const { error: goalsError } = await supabase
        .from('career_goals')
        .insert(careerGoals);

      if (goalsError) {
        console.error('Error creating career goals:', goalsError);
      }
    }

    // Create priority areas
    if (data.priority_areas && data.priority_areas.length > 0) {
      const priorityAreas = data.priority_areas.map((area, index) => ({
        learning_path_id: learningPath.id,
        area_name: area,
        priority: index + 1
      }));

      const { error: areasError } = await supabase
        .from('priority_areas')
        .insert(priorityAreas);

      if (areasError) {
        console.error('Error creating priority areas:', areasError);
      }
    }

    // Create learning plan if provided
    if (data.generated_plan) {
      const { data: learningPlan, error: planError } = await supabase
        .from('learning_plans')
        .insert({
          learning_path_id: learningPath.id,
          summary: data.generated_plan.summary,
          estimated_hours: data.generated_plan.estimatedHours,
          plan_data: data.generated_plan
        })
        .select()
        .single();

      if (!planError && data.generated_plan.quarters) {
        // Create plan quarters
        const quarters = data.generated_plan.quarters.map((quarter: any) => ({
          learning_plan_id: learningPlan.id,
          quarter_number: quarter.quarter,
          title: quarter.title,
          objectives: quarter.objectives,
          resources: quarter.resources,
          milestones: quarter.milestones,
          estimated_hours: quarter.estimatedHours
        }));

        const { error: quartersError } = await supabase
          .from('plan_quarters')
          .insert(quarters);

        if (quartersError) {
          console.error('Error creating plan quarters:', quartersError);
        }
      }
    }

    // Get the complete learning path with all related data
    const { data: completeLearningPath, error: fetchError } = await supabase
      .from('learning_paths')
      .select(`
        *,
        skill_assessments(*),
        career_goals(*),
        priority_areas(*),
        learning_plans(
          *,
          plan_quarters(*)
        )
      `)
      .eq('id', learningPath.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete learning path:', fetchError);
    }

    return NextResponse.json({
      success: true,
      learning_path: completeLearningPath || learningPath
    });
  } catch (error) {
    console.error('Create learning path error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
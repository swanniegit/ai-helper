import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const { data, error } = await supabase
      .from('quiz_templates')
      .select('id, name, skill_category, difficulty_level')
      .eq('is_active', true)
      .limit(10);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      templates: data || []
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  }
}
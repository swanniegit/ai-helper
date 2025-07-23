import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
);

export async function GET(req: NextRequest) {
  try {
    console.log('=== Testing Advanced Gamification Tables ===');
    
    const gamificationTables = [
      'guilds',
      'guild_memberships', 
      'leaderboard_entries',
      'anonymous_names',
      'daily_challenges',
      'user_daily_challenges',
      'challenge_templates',
      'social_interactions',
      'quest_templates',
      'quest_steps',
      'user_quests',
      'skill_tree_nodes',
      'user_skill_progress'
    ];
    
    const tableStatus: Record<string, boolean> = {};
    
    for (const table of gamificationTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${table}' does not exist:`, error.message);
          tableStatus[table] = false;
        } else {
          console.log(`✅ Table '${table}' exists`);
          tableStatus[table] = true;
        }
      } catch (err: any) {
        console.log(`❌ Table '${table}' check failed:`, err.message);
        tableStatus[table] = false;
      }
    }
    
    const existingTables = Object.entries(tableStatus).filter(([, exists]) => exists).map(([table]) => table);
    const missingTables = Object.entries(tableStatus).filter(([, exists]) => !exists).map(([table]) => table);
    
    console.log('Advanced Gamification Tables Check Complete');
    console.log('Existing tables:', existingTables);
    console.log('Missing tables:', missingTables);
    
    return NextResponse.json({
      success: true,
      message: 'Advanced gamification tables check completed',
      results: {
        total_tables: gamificationTables.length,
        existing_tables: existingTables,
        missing_tables: missingTables,
        table_status: tableStatus,
        coverage_percentage: Math.round((existingTables.length / gamificationTables.length) * 100)
      }
    });
    
  } catch (error: any) {
    console.error('Advanced gamification table check error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to check advanced gamification tables',
        success: false 
      },
      { status: 500 }
    );
  }
}
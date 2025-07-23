import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
);

export async function GET(req: NextRequest) {
  try {
    console.log('=== Testing Database Tables Existence ===');
    
    const tablesToCheck = [
      'users',
      'user_sessions', 
      'quiz_templates',
      'quiz_questions',
      'quiz_results',
      'quiz_sessions',
      'user_xp',
      'badge_definitions',
      'user_achievements'
    ];
    
    const tableStatus: Record<string, boolean> = {};
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${table}' does not exist or is not accessible:`, error.message);
          tableStatus[table] = false;
        } else {
          console.log(`✅ Table '${table}' exists and is accessible`);
          tableStatus[table] = true;
        }
      } catch (err: any) {
        console.log(`❌ Table '${table}' check failed:`, err.message);
        tableStatus[table] = false;
      }
    }
    
    const existingTables = Object.entries(tableStatus).filter(([, exists]) => exists).map(([table]) => table);
    const missingTables = Object.entries(tableStatus).filter(([, exists]) => !exists).map(([table]) => table);
    
    console.log('=== Database Tables Check Complete ===');
    console.log('Existing tables:', existingTables);
    console.log('Missing tables:', missingTables);
    
    return NextResponse.json({
      success: true,
      message: 'Database tables check completed',
      results: {
        total_tables: tablesToCheck.length,
        existing_tables: existingTables,
        missing_tables: missingTables,
        table_status: tableStatus,
        core_auth_tables_exist: tableStatus['users'] && tableStatus['user_sessions'],
        quiz_tables_exist: tableStatus['quiz_templates'] && tableStatus['quiz_results'],
        gamification_tables_exist: tableStatus['user_xp'] && tableStatus['badge_definitions']
      }
    });
    
  } catch (error: any) {
    console.error('Database table check error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to check database tables',
        success: false 
      },
      { status: 500 }
    );
  }
}
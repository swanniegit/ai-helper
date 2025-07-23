import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '../../../lib/gamification/gamificationService';

export async function POST(req: NextRequest) {
  try {
    console.log('=== Testing Gamification Service ===');
    
    const testUserId = '550e8400-e29b-41d4-a716-446655440000';
    
    console.log('Step 1: Testing user initialization...');
    await GamificationService.initializeUser(testUserId);
    console.log('✅ User initialized successfully');

    console.log('Step 2: Testing XP award...');
    const xpAward = await GamificationService.awardXP(testUserId, {
      action: 'quiz_completed',
      metadata: {
        quiz_id: 'test-quiz-123',
        skill_category: 'JavaScript',
        difficulty_level: 'intermediate',
        percentage_score: 80,
        is_perfect_score: false
      },
      source_id: 'test-quiz-123',
      source_type: 'quiz'
    });
    
    console.log('✅ XP awarded:', {
      xp_amount: xpAward.xp_amount,
      new_total_xp: xpAward.new_total_xp,
      level_up: !!xpAward.level_up,
      achievements: xpAward.achievements_unlocked?.length || 0
    });

    console.log('Step 3: Testing streak update...');
    const streakUpdate = await GamificationService.updateStreak(testUserId, 'quiz');
    console.log('✅ Streak updated:', {
      current_streak: streakUpdate.current_streak,
      is_new_record: streakUpdate.is_new_record
    });

    console.log('Step 4: Getting user progress...');
    const userProgress = await GamificationService.getUserProgress(testUserId);
    console.log('✅ User progress retrieved:', {
      total_xp: userProgress.xp.total_xp,
      current_level: userProgress.xp.current_level,
      achievements_count: userProgress.achievements.length,
      quiz_streak: userProgress.streaks.quiz_streak
    });

    console.log('=== Gamification Test Completed Successfully ===');

    return NextResponse.json({
      success: true,
      message: 'Gamification service test passed!',
      test_results: {
        initialization: { success: true },
        xp_award: {
          success: true,
          xp_amount: xpAward.xp_amount,
          new_total_xp: xpAward.new_total_xp,
          level_up: !!xpAward.level_up
        },
        streak_update: {
          success: true,
          current_streak: streakUpdate.current_streak,
          is_new_record: streakUpdate.is_new_record
        },
        user_progress: {
          success: true,
          total_xp: userProgress.xp.total_xp,
          current_level: userProgress.xp.current_level
        }
      }
    });

  } catch (error: any) {
    console.error('=== Gamification Test Failed ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: error.message || 'Gamification test failed',
        success: false,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
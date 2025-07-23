import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { QuizService } from '../../../lib/quiz/quizService';

export async function POST(req: NextRequest) {
  try {
    console.log('=== Testing Complete Quiz Flow ===');
    
    const testUserId = '550e8400-e29b-41d4-a716-446655440000';
    
    // Step 1: Generate a quiz
    console.log('Step 1: Generating quiz...');
    const quizRequest = {
      skill_category: 'JavaScript',
      difficulty_level: 'beginner',
      question_count: 2
    };
    
    const quizData = await QuizService.generateQuiz(quizRequest, testUserId);
    console.log('✅ Quiz generated:', {
      session_token: quizData.session_token,
      questions: quizData.questions.length,
      template: quizData.template.name
    });

    // Step 2: Simulate taking the quiz
    console.log('Step 2: Simulating quiz answers...');
    
    // Get the correct answers for perfect score
    const answers: string[] = [];
    const correctAnswers: string[] = [];
    
    for (const question of quizData.questions) {
      const correctAnswer = question.correct_answer;
      correctAnswers.push(correctAnswer);
      
      // Simulate 80% correct answers (get first one wrong, rest correct)
      if (answers.length === 0) {
        // Get first answer wrong intentionally
        const wrongAnswer = question.options?.find(opt => opt !== correctAnswer) || question.options?.[0] || correctAnswer;
        answers.push(wrongAnswer);
      } else {
        // Get rest correct
        answers.push(correctAnswer);
      }
    }

    console.log('Quiz answers simulation:', {
      total_questions: quizData.questions.length,
      user_answers: answers,
      correct_answers: correctAnswers,
      expected_score: answers.filter((ans, idx) => ans === correctAnswers[idx]).length
    });

    // Step 3: Submit the quiz
    console.log('Step 3: Submitting quiz...');
    
    const submitRequest = {
      session_token: quizData.session_token,
      answers: answers,
      time_taken_seconds: 120 // 2 minutes
    };

    const submitResult = await QuizService.submitQuiz(submitRequest, testUserId);
    console.log('✅ Quiz submitted successfully:', {
      score: submitResult.result.score,
      total_questions: submitResult.result.total_questions,
      percentage: submitResult.result.percentage_score,
      passed: submitResult.result.passed,
      feedback: submitResult.result.feedback?.overall_performance
    });

    // Step 4: Verify gamification was triggered
    console.log('Step 4: Checking gamification integration...');
    const gamificationData = (submitResult.result as any).gamification;
    
    if (gamificationData) {
      console.log('✅ Gamification integrated:', {
        xp_awarded: gamificationData.xp_awarded,
        level_up: gamificationData.level_up ? 'Yes' : 'No',
        achievements: gamificationData.achievements_unlocked?.length || 0
      });
    } else {
      console.log('⚠️  No gamification data found');
    }

    // Step 5: Get user progress
    console.log('Step 5: Checking user progress...');
    const userProgress = await QuizService.getUserProgress(testUserId);
    console.log('✅ User progress retrieved:', {
      completed_quizzes: userProgress.completed_quizzes,
      average_score: Math.round(userProgress.average_score * 100) / 100,
      skills_mastered: userProgress.skills_mastered.length,
      recent_performance: userProgress.recent_performance.length
    });

    console.log('=== Quiz Flow Test Completed Successfully ===');

    return NextResponse.json({
      success: true,
      message: 'Complete quiz flow test passed!',
      test_results: {
        quiz_generation: {
          success: true,
          session_token: quizData.session_token,
          questions_generated: quizData.questions.length
        },
        quiz_submission: {
          success: true,
          score: submitResult.result.score,
          total_questions: submitResult.result.total_questions,
          percentage_score: submitResult.result.percentage_score,
          passed: submitResult.result.passed
        },
        gamification: {
          integrated: !!gamificationData,
          xp_awarded: gamificationData?.xp_awarded || 0,
          level_up: !!gamificationData?.level_up
        },
        user_progress: {
          success: true,
          completed_quizzes: userProgress.completed_quizzes,
          average_score: userProgress.average_score
        }
      }
    });

  } catch (error: any) {
    console.error('=== Quiz Flow Test Failed ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: error.message || 'Quiz flow test failed',
        success: false,
        test_stage: 'unknown'
      },
      { status: 500 }
    );
  }
}
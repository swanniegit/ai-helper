import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    console.log('=== Starting quiz generation test ===');
    
    const body = await req.json();
    console.log('Request body:', body);

    const testUserId = '550e8400-e29b-41d4-a716-446655440000';
    const skillCategory = body.skill_category || 'JavaScript';
    const difficulty = body.difficulty_level || 'beginner';
    const count = body.question_count || 3;

    console.log('Test parameters:', { testUserId, skillCategory, difficulty, count });

    // Use service role key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Step 1: Check if user exists
    console.log('Step 1: Checking if user exists...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single();

    if (userError) {
      console.log('User check error:', userError);
      // Try to create user
      const { error: createError } = await supabase
        .from('users')
        .upsert({
          id: testUserId,
          email: 'quiz-test@example.com',
          password_hash: 'test-hash',
          first_name: 'Quiz',
          last_name: 'Test',
          created_at: new Date().toISOString()
        });
      
      if (createError) {
        console.log('User creation failed:', createError);
      } else {
        console.log('Test user created successfully');
      }
    } else {
      console.log('User exists:', userData.email);
    }

    // Step 2: Create a simple fallback question
    console.log('Step 2: Creating fallback questions...');
    const questions = [
      {
        id: uuidv4(),
        template_id: '',
        question_text: 'What is the correct way to declare a variable in JavaScript?',
        question_type: 'multiple_choice',
        options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
        correct_answer: 'var x = 5;',
        explanation: 'var is the traditional way to declare variables in JavaScript',
        difficulty_level: difficulty,
        skill_tags: [skillCategory, 'Variables'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        template_id: '',
        question_text: 'Which method is used to add an element to the end of an array?',
        question_type: 'multiple_choice',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correct_answer: 'push()',
        explanation: 'push() adds elements to the end of an array',
        difficulty_level: difficulty,
        skill_tags: [skillCategory, 'Arrays'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ].slice(0, count);

    console.log(`Step 3: Generated ${questions.length} questions`);

    // Step 3: Create quiz session
    console.log('Step 4: Creating quiz session...');
    const sessionToken = uuidv4();
    const sessionData = {
      id: uuidv4(),
      user_id: testUserId,
      template_id: 'f968cac1-2ec3-4012-933a-93d841326c94', // PHP OOP Fundamentals template
      session_token: sessionToken,
      questions: questions,
      current_question_index: 0,
      answers: [],
      start_time: new Date().toISOString(),
      is_active: true,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
    };

    console.log('Attempting to insert session:', {
      id: sessionData.id,
      user_id: sessionData.user_id,
      session_token: sessionData.session_token,
      questions_count: sessionData.questions.length
    });

    const { error: insertError } = await supabase
      .from('quiz_sessions')
      .insert(sessionData);

    if (insertError) {
      console.error('Quiz session insert error:', insertError);
      throw new Error(`Failed to create quiz session: ${insertError.message}`);
    }

    console.log('Quiz session created successfully!');

    const result = {
      session_token: sessionToken,
      template: {
        id: 'fallback-template',
        name: `${skillCategory} ${difficulty} Quiz`,
        time_limit_minutes: 15
      },
      questions: questions,
      time_limit_minutes: 15,
      total_questions: questions.length
    };

    console.log('=== Quiz generation test completed successfully ===');

    return NextResponse.json({
      success: true,
      data: result,
      debug: {
        user_exists: !!userData,
        questions_generated: questions.length,
        session_created: true
      }
    });

  } catch (error: any) {
    console.error('=== Quiz generation test failed ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: error.message || 'Test failed',
        success: false 
      },
      { status: 500 }
    );
  }
}
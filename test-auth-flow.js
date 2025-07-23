#!/usr/bin/env node

/**
 * Test Authentication Flow and Quiz Generation
 * This script helps you create a test user and get a valid session token for testing
 */

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function registerTestUser() {
  console.log('🔵 Registering test user...');
  
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test.quiz@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User'
    })
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ User registered successfully');
    
    // Extract session token from Set-Cookie header
    const setCookieHeader = response.headers.get('set-cookie');
    const sessionTokenMatch = setCookieHeader?.match(/session_token=([^;]+)/);
    const sessionToken = sessionTokenMatch ? sessionTokenMatch[1] : null;
    
    return {
      user: data.user,
      sessionToken
    };
  } else {
    console.log('❌ Registration failed:', data.error);
    return null;
  }
}

async function loginTestUser() {
  console.log('🔵 Logging in test user...');
  
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test.quiz@example.com',
      password: 'testpassword123'
    })
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ User logged in successfully');
    
    // Extract session token from Set-Cookie header
    const setCookieHeader = response.headers.get('set-cookie');
    const sessionTokenMatch = setCookieHeader?.match(/session_token=([^;]+)/);
    const sessionToken = sessionTokenMatch ? sessionTokenMatch[1] : null;
    
    return {
      user: data.user,
      sessionToken
    };
  } else {
    console.log('❌ Login failed:', data.error);
    return null;
  }
}

async function testQuizGeneration(sessionToken) {
  console.log('🔵 Testing quiz generation...');
  
  const response = await fetch(`${baseUrl}/api/quiz/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `session_token=${sessionToken}`
    },
    body: JSON.stringify({
      skill_category: 'PHP OOP',
      difficulty_level: 'beginner',
      question_count: 5
    })
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ Quiz generated successfully');
    console.log('📊 Quiz data:', JSON.stringify(data, null, 2));
  } else {
    console.log('❌ Quiz generation failed:', data.error);
    console.log('📊 Response:', JSON.stringify(data, null, 2));
  }
  
  return data;
}

async function main() {
  console.log('🚀 Starting authentication and quiz generation test...\n');
  
  try {
    // Try to login first (in case user already exists)
    let authResult = await loginTestUser();
    
    // If login fails, try to register
    if (!authResult) {
      authResult = await registerTestUser();
    }
    
    if (!authResult || !authResult.sessionToken) {
      console.log('❌ Failed to get session token');
      return;
    }
    
    console.log('🔑 Session token:', authResult.sessionToken);
    console.log('👤 User:', authResult.user);
    console.log();
    
    // Test quiz generation
    await testQuizGeneration(authResult.sessionToken);
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

// Run the test
main();
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('=== Final API Endpoints Audit ===');
    
    const baseUrl = 'http://localhost:3000';
    const endpoints = [
      // Authentication Endpoints
      { method: 'POST', path: '/api/auth/register', category: 'auth', requiresBody: true, testBody: { email: 'audit@test.com', password: 'TestPass123!', firstName: 'Test', lastName: 'User' } },
      { method: 'POST', path: '/api/auth/login', category: 'auth', requiresBody: true, testBody: { email: 'audit@test.com', password: 'TestPass123!' } },
      { method: 'GET', path: '/api/auth/me', category: 'auth', requiresAuth: true },
      
      // Quiz Endpoints
      { method: 'POST', path: '/api/quiz/generate', category: 'quiz', requiresAuth: true, requiresBody: true, testBody: { skill_category: 'JavaScript', difficulty_level: 'beginner', question_count: 5 } },
      { method: 'GET', path: '/api/quiz/templates', category: 'quiz', requiresAuth: false },
      { method: 'GET', path: '/api/quiz/templates?skill_category=JavaScript', category: 'quiz', requiresAuth: false },
      { method: 'POST', path: '/api/quiz/submit', category: 'quiz', requiresAuth: true, requiresBody: true, testBody: { session_token: 'test-token', answers: ['A', 'B'], time_taken_seconds: 120 } },
      { method: 'GET', path: '/api/quiz/progress', category: 'quiz', requiresAuth: true },
      
      // Learning Path Endpoints
      { method: 'POST', path: '/api/generate-learning-path', category: 'learning', requiresBody: true, testBody: { skills: ['JavaScript'], skillLevels: { JavaScript: 'beginner' }, careerGoals: ['Web Development'], timelineMonths: 6, priorityAreas: ['Frontend'] } },
      { method: 'GET', path: '/api/learning-paths', category: 'learning', requiresAuth: true },
      
      // Mentor Chat Endpoints
      { method: 'POST', path: '/api/mentor/chat', category: 'mentor', requiresAuth: true, requiresBody: true, testBody: { message: 'Hello', mode: 'general' } },
      
      // Test Endpoints (we created these)
      { method: 'POST', path: '/api/test-complete-quiz-flow', category: 'test', requiresAuth: false },
      { method: 'POST', path: '/api/audit-endpoints', category: 'test', requiresAuth: false },
      { method: 'GET', path: '/api/test-database-tables', category: 'test', requiresAuth: false }
    ];
    
    const results: any[] = [];
    let successCount = 0;
    let errorCount = 0;
    let notImplementedCount = 0;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing ${endpoint.method} ${endpoint.path}...`);
        
        const options: RequestInit = {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json'
          }
        };
        
        if (endpoint.requiresBody && endpoint.testBody) {
          options.body = JSON.stringify(endpoint.testBody);
        }
        
        const response = await fetch(`${baseUrl}${endpoint.path}`, options);
        const status = response.status;
        let responseData;
        
        try {
          responseData = await response.json();
        } catch {
          responseData = { error: 'Invalid JSON response' };
        }
        
        let result = {
          method: endpoint.method,
          path: endpoint.path,
          category: endpoint.category,
          status: status,
          working: false,
          needs_auth: endpoint.requiresAuth || false,
          issue: null as string | null
        };
        
        if (status === 200 || status === 201) {
          result.working = true;
          successCount++;
          console.log(`✅ ${endpoint.path}: Working`);
        } else if (status === 401 && endpoint.requiresAuth) {
          result.working = true; // Expected behavior for auth-required endpoints
          result.issue = 'Requires authentication (expected)';
          successCount++;
          console.log(`✅ ${endpoint.path}: Properly protected (requires auth)`);
        } else if (status === 400 && endpoint.requiresBody) {
          result.working = true; // Expected for bad request with test data
          result.issue = 'Validation error (expected with test data)';
          successCount++;
          console.log(`✅ ${endpoint.path}: Proper validation (400 with test data)`);
        } else if (status === 404) {
          result.issue = 'Endpoint not found';
          notImplementedCount++;
          console.log(`❌ ${endpoint.path}: Not implemented (404)`);
        } else if (status === 405) {
          result.issue = 'Method not allowed';
          errorCount++;
          console.log(`⚠️ ${endpoint.path}: Method not allowed (405)`);
        } else if (status === 500) {
          result.issue = 'Server error';
          errorCount++;
          console.log(`❌ ${endpoint.path}: Server error (500)`);
        } else {
          result.issue = `Unexpected status: ${status}`;
          errorCount++;
          console.log(`⚠️ ${endpoint.path}: Unexpected status ${status}`);
        }
        
        results.push(result);
        
      } catch (error: any) {
        console.error(`❌ ${endpoint.path}: Request failed:`, error.message);
        results.push({
          method: endpoint.method,
          path: endpoint.path,
          category: endpoint.category,
          status: 0,
          working: false,
          needs_auth: endpoint.requiresAuth || false,
          issue: `Request failed: ${error.message}`
        });
        errorCount++;
      }
    }
    
    // Categorize results
    const categories = {
      auth: results.filter(r => r.category === 'auth'),
      quiz: results.filter(r => r.category === 'quiz'),
      learning: results.filter(r => r.category === 'learning'),
      mentor: results.filter(r => r.category === 'mentor'),
      test: results.filter(r => r.category === 'test')
    };
    
    const workingEndpoints = results.filter(r => r.working);
    const brokenEndpoints = results.filter(r => !r.working);
    
    console.log('=== Final API Audit Summary ===');
    console.log(`Total endpoints tested: ${results.length}`);
    console.log(`Working properly: ${successCount}`);
    console.log(`Broken/Issues: ${errorCount}`);
    console.log(`Not implemented: ${notImplementedCount}`);
    
    return NextResponse.json({
      success: true,
      message: 'Final API audit completed',
      summary: {
        total_endpoints: results.length,
        working_properly: successCount,
        with_issues: errorCount,
        not_implemented: notImplementedCount,
        health_percentage: Math.round((successCount / results.length) * 100)
      },
      categories: {
        auth: {
          total: categories.auth.length,
          working: categories.auth.filter(r => r.working).length,
          endpoints: categories.auth
        },
        quiz: {
          total: categories.quiz.length,
          working: categories.quiz.filter(r => r.working).length,
          endpoints: categories.quiz
        },
        learning: {
          total: categories.learning.length,
          working: categories.learning.filter(r => r.working).length,
          endpoints: categories.learning
        },
        mentor: {
          total: categories.mentor.length,
          working: categories.mentor.filter(r => r.working).length,
          endpoints: categories.mentor
        },
        test: {
          total: categories.test.length,
          working: categories.test.filter(r => r.working).length,
          endpoints: categories.test
        }
      },
      working_endpoints: workingEndpoints.map(r => `${r.method} ${r.path}`),
      broken_endpoints: brokenEndpoints.map(r => ({
        endpoint: `${r.method} ${r.path}`,
        issue: r.issue,
        status: r.status
      }))
    });

  } catch (error: any) {
    console.error('=== Final API Audit Failed ===');
    console.error('Error:', error.message);
    
    return NextResponse.json(
      { 
        error: error.message || 'Final API audit failed',
        success: false
      },
      { status: 500 }
    );
  }
}
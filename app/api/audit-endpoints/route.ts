import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== API Endpoints Audit ===');
    
    const results: any = {};
    const baseUrl = 'http://localhost:3000';
    
    // Test various endpoint categories
    const endpoints = [
      // Authentication endpoints
      { 
        path: '/api/auth/me', 
        method: 'GET', 
        category: 'auth',
        needsAuth: true,
        description: 'Get current user info'
      },
      
      // Quiz endpoints
      { 
        path: '/api/quiz/templates', 
        method: 'GET', 
        category: 'quiz',
        needsAuth: false,
        description: 'Get quiz templates'
      },
      { 
        path: '/api/quiz/progress', 
        method: 'GET', 
        category: 'quiz',
        needsAuth: true,
        description: 'Get user quiz progress'
      },
      { 
        path: '/api/quiz/session', 
        method: 'POST', 
        category: 'quiz',
        needsAuth: true,
        description: 'Create/manage quiz session',
        testData: { session_token: 'test' }
      },
      
      // Gamification endpoints
      { 
        path: '/api/gamification/progress', 
        method: 'GET', 
        category: 'gamification',
        needsAuth: true,
        description: 'Get user gamification progress'
      },
      { 
        path: '/api/gamification/init', 
        method: 'POST', 
        category: 'gamification',
        needsAuth: true,
        description: 'Initialize user gamification'
      },
      { 
        path: '/api/gamification/xp', 
        method: 'POST', 
        category: 'gamification',
        needsAuth: true,
        description: 'Award XP to user',
        testData: { action: 'quiz_completed', metadata: {} }
      },
      
      // Learning paths
      { 
        path: '/api/learning-paths', 
        method: 'GET', 
        category: 'learning',
        needsAuth: true,
        description: 'Get user learning paths'
      },
      { 
        path: '/api/generate-learning-path', 
        method: 'POST', 
        category: 'learning',
        needsAuth: true,
        description: 'Generate AI learning path',
        testData: { 
          skills: ['JavaScript'], 
          goals: ['Learn React'], 
          timeline: '3 months' 
        }
      },
      
      // Mentor chat
      { 
        path: '/api/mentor/chat', 
        method: 'POST', 
        category: 'mentor',
        needsAuth: true,
        description: 'AI mentor chat',
        testData: { 
          message: 'Hello, can you help me with JavaScript?',
          mode: 'general'
        }
      },
      
      // Quests
      { 
        path: '/api/quests', 
        method: 'GET', 
        category: 'quests',
        needsAuth: true,
        description: 'Get available quests'
      },
      { 
        path: '/api/quests/progress', 
        method: 'GET', 
        category: 'quests',
        needsAuth: true,
        description: 'Get quest progress'
      },
      
      // Social/Guild features
      { 
        path: '/api/social/leaderboard', 
        method: 'GET', 
        category: 'social',
        needsAuth: true,
        description: 'Get leaderboard data'
      },
      { 
        path: '/api/social/guilds', 
        method: 'GET', 
        category: 'social',
        needsAuth: true,
        description: 'Get available guilds'
      },
      
      // Skill trees
      { 
        path: '/api/skill-tree/paths', 
        method: 'GET', 
        category: 'skill-tree',
        needsAuth: true,
        description: 'Get skill tree paths'
      },
      
      // Avatar system
      { 
        path: '/api/avatar', 
        method: 'GET', 
        category: 'avatar',
        needsAuth: true,
        description: 'Get user avatar data'
      },
      { 
        path: '/api/avatar/presets', 
        method: 'GET', 
        category: 'avatar',
        needsAuth: false,
        description: 'Get avatar presets'
      }
    ];

    // Test each endpoint
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing ${endpoint.method} ${endpoint.path}...`);
        
        const options: any = {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
          }
        };

        // Add test data for POST requests
        if (endpoint.method === 'POST' && endpoint.testData) {
          options.body = JSON.stringify(endpoint.testData);
        }

        // Add fake auth for endpoints that need it (they'll fail with 401, which is expected)
        if (endpoint.needsAuth) {
          options.headers['Cookie'] = 'session_token=fake-token-for-testing';
        }

        const response = await fetch(baseUrl + endpoint.path, options);
        const responseText = await response.text();
        
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = responseText;
        }

        results[endpoint.path] = {
          status: response.status,
          category: endpoint.category,
          description: endpoint.description,
          needsAuth: endpoint.needsAuth,
          success: response.status < 500,
          error: response.status >= 400 ? responseData : null,
          working: response.status === 200 || (endpoint.needsAuth && response.status === 401)
        };

        // Log results
        if (response.status < 400) {
          console.log(`✅ ${endpoint.path}: ${response.status}`);
        } else if (endpoint.needsAuth && response.status === 401) {
          console.log(`🔒 ${endpoint.path}: ${response.status} (Auth required - expected)`);
        } else if (response.status >= 500) {
          console.log(`❌ ${endpoint.path}: ${response.status} (Server error)`);
        } else {
          console.log(`⚠️  ${endpoint.path}: ${response.status}`);
        }

      } catch (error: any) {
        console.log(`💥 ${endpoint.path}: Network error - ${error.message}`);
        results[endpoint.path] = {
          status: 'ERROR',
          category: endpoint.category,
          description: endpoint.description,
          success: false,
          error: error.message,
          working: false
        };
      }
    }

    // Summarize results
    const summary = {
      total_tested: endpoints.length,
      working: Object.values(results).filter((r: any) => r.working).length,
      server_errors: Object.values(results).filter((r: any) => r.status >= 500).length,
      client_errors: Object.values(results).filter((r: any) => r.status >= 400 && r.status < 500).length,
      success: Object.values(results).filter((r: any) => r.status === 200).length
    };

    console.log('=== Audit Summary ===');
    console.log(`Total tested: ${summary.total_tested}`);
    console.log(`Working (200 or expected 401): ${summary.working}`);
    console.log(`Server errors (5xx): ${summary.server_errors}`);
    console.log(`Client errors (4xx): ${summary.client_errors}`);
    console.log(`Successful (200): ${summary.success}`);

    return NextResponse.json({
      success: true,
      message: 'API endpoints audit completed',
      summary,
      results
    });

  } catch (error: any) {
    console.error('Audit error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Audit failed',
        success: false 
      },
      { status: 500 }
    );
  }
}
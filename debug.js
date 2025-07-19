#!/usr/bin/env node

/**
 * Debug Helper Script
 * 
 * Usage:
 *   node debug.js test-db          # Test database connection
 *   node debug.js test-auth        # Test authentication
 *   node debug.js test-quiz        # Test quiz generation
 *   node debug.js logs             # Show recent logs
 *   node debug.js health           # Health check all services
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const command = process.argv[2];

const runCommand = (cmd, description) => {
  console.log(`\n🔍 ${description}...`);
  console.log(`Running: ${cmd}\n`);
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️ Warning: ${stderr}`);
    }
    console.log(`✅ ${description} completed:`);
    console.log(stdout);
  });
};

const testEndpoint = async (url, description) => {
  try {
    console.log(`\n🔍 Testing ${description}...`);
    const response = await fetch(url);
    const data = await response.json();
    console.log(`✅ ${description}: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
  }
};

switch (command) {
  case 'test-db':
    runCommand('curl -s http://localhost:3000/api/test-supabase', 'Database Connection Test');
    break;
    
  case 'test-auth':
    runCommand('curl -s http://localhost:3000/api/auth/me', 'Authentication Test');
    break;
    
  case 'test-quiz':
    runCommand('curl -s http://localhost:3000/api/quiz/templates', 'Quiz Templates Test');
    break;
    
  case 'logs':
    runCommand('docker-compose logs --tail=50 app', 'Recent Application Logs');
    break;
    
  case 'health':
    console.log('🏥 Running Health Checks...\n');
    runCommand('docker-compose ps', 'Container Status');
    setTimeout(() => {
      runCommand('curl -s http://localhost:3000/api/simple-test', 'API Health Check');
    }, 1000);
    break;
    
  case 'clear-logs':
    runCommand('docker-compose logs --tail=0 app > /dev/null', 'Clearing Logs');
    break;
    
  default:
    console.log(`
🐛 Debug Helper Script

Available commands:
  test-db     - Test database connection
  test-auth   - Test authentication
  test-quiz   - Test quiz generation
  logs        - Show recent logs
  health      - Health check all services
  clear-logs  - Clear application logs

Usage: node debug.js <command>
    `);
}
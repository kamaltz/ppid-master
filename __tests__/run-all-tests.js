#!/usr/bin/env node

/**
 * Comprehensive test runner for PPID Garut application
 * Tests all endpoints, components, and features
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting comprehensive test suite for PPID Garut...\n');

// Test categories
const testCategories = {
  'API Tests': [
    '__tests__/api/auth.test.js',
    '__tests__/api/admin.test.js',
    '__tests__/api/permintaan.test.js',
    '__tests__/api/informasi.test.js',
    '__tests__/api/keberatan.test.js',
    '__tests__/api/kategori.test.js',
    '__tests__/api/upload.test.js',
    '__tests__/api/settings.test.js',
    '__tests__/api/assign-ppid.test.js',
    '__tests__/api/chat.test.js',
    '__tests__/api/ppid-chat-simple.test.js',
    '__tests__/api/health.test.js',
    '__tests__/api/uploads.test.js',
    '__tests__/api/activity-logs.test.js'
  ],
  'Component Tests': [
    '__tests__/components/auth.test.jsx'
  ],
  'Integration Tests': [
    '__tests__/integration/complete-flow.test.js'
  ],
  'Utility Tests': [
    '__tests__/utils/validation.test.js'
  ]
};

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failedCategories = [];

// Run tests by category
async function runTestCategory(categoryName, testFiles) {
  console.log(`\n📋 Running ${categoryName}...`);
  console.log('=' .repeat(50));
  
  for (const testFile of testFiles) {
    const fullPath = path.join(process.cwd(), testFile);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Test file not found: ${testFile}`);
      continue;
    }
    
    try {
      console.log(`\n🧪 Running: ${testFile}`);
      
      // Run individual test file
      const result = execSync(`npx jest ${testFile} --verbose`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log(`✅ Passed: ${testFile}`);
      passedTests++;
      
    } catch (error) {
      console.log(`❌ Failed: ${testFile}`);
      console.log(`Error: ${error.message}`);
      failedTests++;
      failedCategories.push(`${categoryName}: ${testFile}`);
    }
    
    totalTests++;
  }
}

// Main test execution
async function runAllTests() {
  const startTime = Date.now();
  
  try {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret-key';
    
    console.log('🔧 Environment setup complete');
    console.log('📊 Test Categories:', Object.keys(testCategories).length);
    console.log('📁 Total Test Files:', Object.values(testCategories).flat().length);
    
    // Run each test category
    for (const [categoryName, testFiles] of Object.entries(testCategories)) {
      await runTestCategory(categoryName, testFiles);
    }
    
    // Generate test report
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY REPORT');
    console.log('='.repeat(60));
    console.log(`⏱️  Total Duration: ${duration}s`);
    console.log(`📈 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📊 Success Rate: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      failedCategories.forEach(failure => {
        console.log(`   - ${failure}`);
      });
    }
    
    // Coverage report
    console.log('\n📋 Generating coverage report...');
    try {
      execSync('npx jest --coverage --coverageReporters=text-summary', {
        stdio: 'inherit'
      });
    } catch (error) {
      console.log('⚠️  Coverage report generation failed');
    }
    
    console.log('\n🎉 Test execution completed!');
    
    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n💥 Test execution failed:', error.message);
    process.exit(1);
  }
}

// Feature-specific test runners
const featureTests = {
  auth: () => runTestCategory('Authentication', ['__tests__/api/auth.test.js', '__tests__/components/auth.test.jsx']),
  admin: () => runTestCategory('Admin Features', ['__tests__/api/admin.test.js', '__tests__/api/assign-ppid.test.js', '__tests__/api/activity-logs.test.js']),
  requests: () => runTestCategory('Request Management', ['__tests__/api/permintaan.test.js']),
  information: () => runTestCategory('Information Management', ['__tests__/api/informasi.test.js']),
  objections: () => runTestCategory('Objection Management', ['__tests__/api/keberatan.test.js']),
  categories: () => runTestCategory('Category Management', ['__tests__/api/kategori.test.js']),
  uploads: () => runTestCategory('File Upload', ['__tests__/api/upload.test.js', '__tests__/api/uploads.test.js']),
  settings: () => runTestCategory('Settings Management', ['__tests__/api/settings.test.js']),
  chat: () => runTestCategory('Chat System', ['__tests__/api/chat.test.js', '__tests__/api/ppid-chat-simple.test.js']),
  health: () => runTestCategory('Health Check', ['__tests__/api/health.test.js']),
  integration: () => runTestCategory('Integration Tests', ['__tests__/integration/complete-flow.test.js']),
  utils: () => runTestCategory('Utilities', ['__tests__/utils/validation.test.js'])
};

// Command line argument handling
const args = process.argv.slice(2);
const command = args[0];

if (command && featureTests[command]) {
  console.log(`🎯 Running specific feature tests: ${command}`);
  featureTests[command]().then(() => {
    console.log(`✅ ${command} tests completed`);
  }).catch(error => {
    console.error(`❌ ${command} tests failed:`, error.message);
    process.exit(1);
  });
} else if (command === 'help' || command === '--help' || command === '-h') {
  console.log('📖 PPID Garut Test Runner');
  console.log('\nUsage:');
  console.log('  node __tests__/run-all-tests.js [feature]');
  console.log('\nAvailable features:');
  Object.keys(featureTests).forEach(feature => {
    console.log(`  - ${feature}`);
  });
  console.log('\nExamples:');
  console.log('  node __tests__/run-all-tests.js auth     # Run authentication tests');
  console.log('  node __tests__/run-all-tests.js admin    # Run admin tests');
  console.log('  node __tests__/run-all-tests.js          # Run all tests');
} else {
  // Run all tests
  runAllTests();
}

module.exports = {
  runAllTests,
  featureTests,
  testCategories
};
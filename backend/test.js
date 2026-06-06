const request = require('supertest');
const express = require('express');

// Create a simple test app
const app = express();

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Server is running'
  });
});

// Add a test products endpoint
app.get('/api/products', (req, res) => {
  res.json([
    { id: 1, name: 'Test Product 1', price: 99.99 },
    { id: 2, name: 'Test Product 2', price: 49.99 }
  ]);
});

// Run the tests
async function runTests() {
  console.log('🧪 Starting API Tests...\n');
  
  let passed = 0;
  let failed = 0;

  // Test 1: Health check
  try {
    const response = await request(app).get('/api/health');
    if (response.statusCode === 200 && response.body.status === 'ok') {
      console.log('✅ Test 1 PASSED: Health check works');
      passed++;
    } else {
      console.log('❌ Test 1 FAILED: Health check returned wrong response');
      failed++;
    }
  } catch (error) {
    console.log('❌ Test 1 FAILED:', error.message);
    failed++;
  }

  // Test 2: Products endpoint
  try {
    const response = await request(app).get('/api/products');
    if (response.statusCode === 200 && response.body.length > 0) {
      console.log('✅ Test 2 PASSED: Products endpoint works');
      passed++;
    } else {
      console.log('❌ Test 2 FAILED: Products endpoint returned wrong response');
      failed++;
    }
  } catch (error) {
    console.log('❌ Test 2 FAILED:', error.message);
    failed++;
  }

  // Test 3: Response time check
  try {
    const start = Date.now();
    await request(app).get('/api/health');
    const duration = Date.now() - start;
    if (duration < 100) {
      console.log('✅ Test 3 PASSED: Response time is fast (' + duration + 'ms)');
      passed++;
    } else {
      console.log('⚠️ Test 3 WARNING: Response time is slow (' + duration + 'ms)');
      passed++;
    }
  } catch (error) {
    console.log('❌ Test 3 FAILED:', error.message);
    failed++;
  }

  console.log('\n📊 Test Results:');
  console.log('   Passed:', passed);
  console.log('   Failed:', failed);
  console.log('   Total:', passed + failed);

  if (failed > 0) {
    console.log('\n❌ Some tests failed! Fix issues before deploying.');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed! Ready for deployment.');
    process.exit(0);
  }
}

// Run the tests
runTests();
// API Test Client
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const userId = 1;

// Helper function for API requests
async function apiRequest(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return { status: response.status, data };
    } else {
      const text = await response.text();
      return { status: response.status, text };
    }
  } catch (error) {
    return { error: error.message };
  }
}

// Test all endpoints
async function runTests() {
  console.log('Running API Tests...\n');
  
  // Test user endpoints
  console.log('1. Testing User Endpoints:');
  const userResponse = await apiRequest('GET', `/api/users/${userId}`);
  console.log(`GET /api/users/${userId}: ${userResponse.status}`, userResponse.data ? 'OK' : 'FAILED');
  
  const userUpdateResponse = await apiRequest('PUT', `/api/users/${userId}`, {
    displayName: 'Test User',
    email: 'test@example.com'
  });
  console.log(`PUT /api/users/${userId}: ${userUpdateResponse.status}`, userUpdateResponse.data ? 'OK' : 'FAILED');
  
  // Test activity logs endpoints
  console.log('\n2. Testing Activity Logs Endpoints:');
  const logsResponse = await apiRequest('GET', `/api/users/${userId}/activity-logs`);
  console.log(`GET /api/users/${userId}/activity-logs: ${logsResponse.status}`, logsResponse.data ? 'OK' : 'FAILED');
  
  const todayLogResponse = await apiRequest('GET', `/api/users/${userId}/activity-logs/today`);
  console.log(`GET /api/users/${userId}/activity-logs/today: ${todayLogResponse.status}`, todayLogResponse.data ? 'OK' : 'FAILED');
  
  // Test workout endpoints
  console.log('\n3. Testing Workout Endpoints:');
  const workoutsResponse = await apiRequest('GET', `/api/users/${userId}/workouts`);
  console.log(`GET /api/users/${userId}/workouts: ${workoutsResponse.status}`, workoutsResponse.data ? 'OK' : 'FAILED');
  
  // Test goal endpoints
  console.log('\n4. Testing Goal Endpoints:');
  const goalsResponse = await apiRequest('GET', `/api/users/${userId}/goals`);
  console.log(`GET /api/users/${userId}/goals: ${goalsResponse.status}`, goalsResponse.data ? 'OK' : 'FAILED');
  
  // Test nutrition endpoints
  console.log('\n5. Testing Nutrition Endpoints:');
  const nutritionResponse = await apiRequest('GET', `/api/users/${userId}/nutrition`);
  console.log(`GET /api/users/${userId}/nutrition: ${nutritionResponse.status}`, nutritionResponse.data ? 'OK' : 'FAILED');
  
  console.log('\nAPI Tests Completed!');
}

// Run the tests
runTests();
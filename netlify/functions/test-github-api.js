const axios = require('axios');

async function testGitHubModelsAPI() {
  // First, let's test with a simple error response
  try {
    console.log('\n--- Test 1: Simple error response ---');
    // Simulate a 401 error with a string response
    const error1 = {
      response: {
        status: 401,
        data: 'Unauthorized\n'
      }
    };
    
    // Simulate the error handling in chat.js
    let errorMessage1;
    if (error1.response?.data?.error) {
      errorMessage1 = typeof error1.response.data.error === 'object' 
        ? JSON.stringify(error1.response.data.error) 
        : error1.response.data.error;
    } else if (error1.response?.data) {
      errorMessage1 = typeof error1.response.data === 'object' 
        ? JSON.stringify(error1.response.data) 
        : error1.response.data;
    } else {
      errorMessage1 = 'An unknown error occurred with GitHub Models API';
    }
    
    console.log('Backend error message:', errorMessage1);
    
    // Simulate the frontend error handling
    const frontendError1 = new Error(errorMessage1 || 'Something went wrong.');
    console.log('Frontend error message:', frontendError1.message);
    
    // Now, let's test with a complex error response that might cause [object Object]
    console.log('\n--- Test 2: Complex error response ---');
    // Simulate an error with an object response
    const error2 = {
      response: {
        status: 400,
        data: {
          error: {
            message: 'Invalid request parameters',
            code: 'invalid_request',
            details: {
              field: 'model',
              reason: 'Model not found'
            }
          }
        }
      }
    };
    
    // Simulate the error handling in chat.js
    let errorMessage2;
    if (error2.response?.data?.error) {
      errorMessage2 = typeof error2.response.data.error === 'object' 
        ? JSON.stringify(error2.response.data.error) 
        : error2.response.data.error;
    } else if (error2.response?.data) {
      errorMessage2 = typeof error2.response.data === 'object' 
        ? JSON.stringify(error2.response.data) 
        : error2.response.data;
    } else {
      errorMessage2 = 'An unknown error occurred with GitHub Models API';
    }
    
    console.log('Backend error message:', errorMessage2);
    
    // Simulate the frontend error handling
    const frontendError2 = new Error(errorMessage2 || 'Something went wrong.');
    console.log('Frontend error message:', frontendError2.message);
    
    // Test 3: What if error.response.data.error is directly an object without stringifying?
    console.log('\n--- Test 3: Object error without stringifying ---');
    const error3 = {
      response: {
        status: 400,
        data: {
          error: {
            message: 'Invalid request parameters',
            code: 'invalid_request',
            details: {
              field: 'model',
              reason: 'Model not found'
            }
          }
        }
      }
    };
    
    // Simulate broken error handling (not stringifying objects)
    let errorMessage3;
    if (error3.response?.data?.error) {
      // This is the problematic part - not stringifying objects
      errorMessage3 = error3.response.data.error;
    } else if (error3.response?.data) {
      errorMessage3 = error3.response.data;
    } else {
      errorMessage3 = 'An unknown error occurred with GitHub Models API';
    }
    
    console.log('Backend error message (raw):', errorMessage3);
    console.log('Backend error message (toString):', errorMessage3.toString());
    
    // Simulate the frontend error handling
    const frontendError3 = new Error(errorMessage3 || 'Something went wrong.');
    console.log('Frontend error message:', frontendError3.message);
    
  } catch (error) {
    console.error('Test script error:', error);
  }
}

testGitHubModelsAPI();
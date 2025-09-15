const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api';

async function testRegistration() {
  try {
    console.log('Testing registration API...');

    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'attendee'
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('Response:', data);
    } else {
      console.log('❌ Registration failed!');
      console.log('Status:', response.status);
      console.log('Response:', data);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    console.log('Make sure the backend server is running on port 3000');
  }
}

testRegistration();

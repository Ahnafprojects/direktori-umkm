// Test API analytics langsung
const fetch = require('node-fetch');

async function testAnalyticsAPI() {
  try {
    console.log('Testing analytics API endpoint...');
    
    // Login first untuk mendapatkan session
    const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ahnafajaib@gmail.com',
        password: 'password123'
      })
    });
    
    console.log('Login response status:', loginResponse.status);
    
    if (loginResponse.ok) {
      // Test analytics API
      const analyticsResponse = await fetch('http://localhost:3000/api/umkm/51/analytics');
      console.log('Analytics response status:', analyticsResponse.status);
      
      if (analyticsResponse.ok) {
        const data = await analyticsResponse.json();
        console.log('Analytics data:', JSON.stringify(data, null, 2));
        
        if (data.salesData) {
          console.log('Sales data found:', data.salesData);
        } else {
          console.log('NO SALES DATA!');
        }
      } else {
        const errorText = await analyticsResponse.text();
        console.log('Analytics API error:', errorText);
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAnalyticsAPI();
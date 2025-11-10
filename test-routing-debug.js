// test-routing-debug.js
// Simple test to debug routing issue directly

async function testRouting() {
  console.log('Testing routing issues...');
  
  try {
    // Test homepage - should work
    console.log('\n1. Testing homepage...');
    const homeResponse = await fetch('https://direktori-umkm-direct.netlify.app/');
    console.log('Homepage status:', homeResponse.status);
    
    // Test API debug endpoint - should work after middleware disabled
    console.log('\n2. Testing debug API...');
    const apiResponse = await fetch('https://direktori-umkm-direct.netlify.app/api/debug/database');
    console.log('API debug status:', apiResponse.status);
    
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log('API data:', apiData);
      
      // Test individual UMKM page if we have data
      if (apiData.umkms && apiData.umkms.length > 0) {
        const firstUmkm = apiData.umkms[0];
        console.log('\n3. Testing UMKM page with slug:', firstUmkm.slug);
        
        const umkmResponse = await fetch(`https://direktori-umkm-direct.netlify.app/umkm/${firstUmkm.slug}`);
        console.log('UMKM page status:', umkmResponse.status);
        
        if (!umkmResponse.ok) {
          const errorText = await umkmResponse.text();
          console.log('Error response:', errorText.substring(0, 500));
        } else {
          console.log('UMKM page loaded successfully!');
        }
      }
    } else {
      console.log('API debug failed, status:', apiResponse.status);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test if in Node.js environment
if (typeof require !== 'undefined' && require.main === module) {
  testRouting();
}
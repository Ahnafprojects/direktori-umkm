// Test filter categories 
import fetch from 'node-fetch';

async function testCategoryFilter() {
  const baseUrl = 'http://localhost:3000';
  const categories = ['', 'makanan', 'minuman', 'jasa', 'belanja'];
  
  console.log('=== TESTING CATEGORY FILTER ===\n');
  
  for (const category of categories) {
    const url = category ? `${baseUrl}/?category=${category}` : baseUrl;
    console.log(`Testing: ${url}`);
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        const html = await response.text();
        
        // Count UMKM cards in response
        const cardMatches = html.match(/umkm-card/g);
        const cardCount = cardMatches ? cardMatches.length : 0;
        
        console.log(`  Status: ${response.status} OK`);
        console.log(`  UMKM Found: ${cardCount}`);
        
        // Check for error messages
        if (html.includes('tidak ditemukan')) {
          console.log('  ⚠️  "Tidak ditemukan" message found');
        } else {
          console.log('  ✅ Success');
        }
      } else {
        console.log(`  ❌ Error: ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
}

testCategoryFilter().catch(console.error);
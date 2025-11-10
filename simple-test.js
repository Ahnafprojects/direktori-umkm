// simple-test.js
const https = require('https');

function testURL(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data.substring(0, 200)
        });
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    console.log('Testing site availability...');
    const result = await testURL('https://direktori-umkm-direct.netlify.app/');
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
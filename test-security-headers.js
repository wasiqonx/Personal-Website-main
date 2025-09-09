const https = require('https');

const options = {
  hostname: 'wasiq.in',
  port: 443,
  path: '/',
  method: 'HEAD'
};

const req = https.request(options, (res) => {
  console.log('🛡️ Security Headers Check:\n');

  const securityHeaders = [
    'x-frame-options',
    'x-content-type-options',
    'x-xss-protection',
    'content-security-policy',
    'x-robots-tag',
    'strict-transport-security'
  ];

  securityHeaders.forEach(header => {
    const value = res.headers[header];
    if (value) {
      console.log(`✅ ${header}: ${value}`);
    } else {
      console.log(`❌ ${header}: Missing`);
    }
  });

  console.log(`\n📊 Status Code: ${res.statusCode}`);
});

req.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
  console.log('\n💡 Note: This test requires your domain to be live with Cloudflare');
});

req.end();

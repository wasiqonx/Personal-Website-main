#!/usr/bin/env node

const https = require('https');
const http = require('http');

console.log('🛡️  Cloudflare Setup Verification\n');

// Configuration
const domain = 'wasiq.in';
const testUrl = `https://${domain}`;

console.log(`Testing domain: ${domain}\n`);

// Test 1: Basic connectivity
function testConnectivity() {
  return new Promise((resolve) => {
    const req = https.request(testUrl, { method: 'HEAD' }, (res) => {
      console.log('🌐 Connectivity Test:');
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Server: ${res.headers.server || 'Unknown'}`);

      const isCloudflare = res.headers.server && res.headers.server.includes('cloudflare');
      console.log(`   Cloudflare: ${isCloudflare ? '✅ Detected' : '❌ Not detected'}`);

      resolve({
        status: res.statusCode,
        isCloudflare: isCloudflare,
        headers: res.headers
      });
    });

    req.on('error', (err) => {
      console.log('❌ Connectivity Test Failed:');
      console.log(`   Error: ${err.message}`);
      resolve({ error: err.message });
    });

    req.setTimeout(10000, () => {
      console.log('❌ Connectivity Test Timeout');
      req.abort();
      resolve({ error: 'Timeout' });
    });

    req.end();
  });
}

// Test 2: Security headers
function testSecurityHeaders(headers) {
  console.log('\n🔒 Security Headers Test:');

  const securityHeaders = [
    { name: 'x-frame-options', required: true },
    { name: 'x-content-type-options', required: true },
    { name: 'x-xss-protection', required: false },
    { name: 'strict-transport-security', required: false },
    { name: 'content-security-policy', required: false },
    { name: 'x-robots-tag', required: false }
  ];

  let passed = 0;
  let total = securityHeaders.length;

  securityHeaders.forEach(({ name, required }) => {
    const value = headers[name];
    if (value) {
      console.log(`   ✅ ${name}: ${value}`);
      passed++;
    } else if (required) {
      console.log(`   ❌ ${name}: Missing (Required)`);
    } else {
      console.log(`   ⚠️  ${name}: Missing (Optional)`);
    }
  });

  console.log(`   Security Score: ${passed}/${total} headers present`);
  return { passed, total };
}

// Test 3: Performance headers
function testPerformanceHeaders(headers) {
  console.log('\n⚡ Performance Headers Test:');

  const cacheControl = headers['cache-control'];
  const cfCacheStatus = headers['cf-cache-status'];
  const cfRay = headers['cf-ray'];

  if (cacheControl) {
    console.log(`   ✅ Cache-Control: ${cacheControl}`);
  } else {
    console.log('   ⚠️  Cache-Control: Not set');
  }

  if (cfCacheStatus) {
    console.log(`   ✅ CF-Cache-Status: ${cfCacheStatus}`);
  } else {
    console.log('   ⚠️  CF-Cache-Status: Not present (might be HIT/MISS/DYNAMIC)');
  }

  if (cfRay) {
    console.log(`   ✅ CF-Ray: ${cfRay.substring(0, 8)}... (Cloudflare request ID)`);
  } else {
    console.log('   ⚠️  CF-Ray: Not present');
  }
}

// Test 4: DNS propagation
function testDNSPropagation() {
  console.log('\n🌍 DNS Propagation Test:');

  return new Promise((resolve) => {
    // Simple DNS lookup test
    const dns = require('dns');

    dns.lookup(domain, (err, address, family) => {
      if (err) {
        console.log('   ❌ DNS Lookup Failed');
        console.log(`   Error: ${err.message}`);
        resolve(false);
      } else {
        console.log(`   ✅ DNS Resolved: ${address} (IPv${family})`);

        // Check if it's a Cloudflare IP range (basic check)
        const isCloudflareIP = address.startsWith('104.') ||
                              address.startsWith('108.') ||
                              address.startsWith('141.') ||
                              address.startsWith('162.') ||
                              address.startsWith('172.') ||
                              address.startsWith('173.') ||
                              address.startsWith('188.') ||
                              address.startsWith('190.') ||
                              address.startsWith('197.') ||
                              address.startsWith('198.');

        console.log(`   Cloudflare IP Range: ${isCloudflareIP ? '✅ Yes' : '⚠️  No'}`);
        resolve(isCloudflareIP);
      }
    });
  });
}

// Main test execution
async function runTests() {
  try {
    // Test connectivity and get headers
    const connectivityResult = await testConnectivity();

    if (connectivityResult.error) {
      console.log('\n❌ Cannot continue tests due to connectivity issues');
      return;
    }

    // Test security headers
    const securityResult = testSecurityHeaders(connectivityResult.headers);

    // Test performance headers
    testPerformanceHeaders(connectivityResult.headers);

    // Test DNS
    const isCloudflareIP = await testDNSPropagation();

    // Final summary
    console.log('\n📊 Test Summary:');
    console.log('================');

    let overallScore = 0;
    let maxScore = 4;

    // Connectivity (1 point)
    if (connectivityResult.status === 200) {
      console.log('✅ Connectivity: PASS');
      overallScore++;
    } else {
      console.log('❌ Connectivity: FAIL');
    }

    // Cloudflare detection (1 point)
    if (connectivityResult.isCloudflare) {
      console.log('✅ Cloudflare Detection: PASS');
      overallScore++;
    } else {
      console.log('❌ Cloudflare Detection: FAIL');
    }

    // Security headers (1 point)
    if (securityResult.passed >= 2) {
      console.log('✅ Security Headers: PASS');
      overallScore++;
    } else {
      console.log('⚠️  Security Headers: NEEDS IMPROVEMENT');
    }

    // DNS propagation (1 point)
    if (isCloudflareIP) {
      console.log('✅ DNS Propagation: PASS');
      overallScore++;
    } else {
      console.log('⚠️  DNS Propagation: IN PROGRESS');
    }

    console.log(`\n🎯 Overall Score: ${overallScore}/${maxScore}`);

    if (overallScore === maxScore) {
      console.log('\n🎉 Excellent! Your Cloudflare setup is working perfectly!');
    } else if (overallScore >= 2) {
      console.log('\n👍 Good! Your Cloudflare setup is mostly working.');
      console.log('   Check the warnings above for improvements.');
    } else {
      console.log('\n⚠️  Your Cloudflare setup needs attention.');
      console.log('   Review the errors above and check your configuration.');
    }

    console.log('\n💡 Tips:');
    console.log('   - If DNS propagation is in progress, wait 24-48 hours');
    console.log('   - Check Cloudflare dashboard for any configuration issues');
    console.log('   - Ensure your domain nameservers point to Cloudflare');

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

// Run the tests
runTests();

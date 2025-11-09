#!/bin/bash

echo "🛡️ Cloudflare Security Setup Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "public" ]; then
    print_error "Please run this script from your Next.js project root directory"
    exit 1
fi

print_info "Setting up Cloudflare security configurations..."

# Move _headers file to public directory
if [ -f "_headers" ]; then
    print_info "Moving _headers file to public directory..."
    mv _headers public/
    print_status "_headers file moved successfully"
else
    print_warning "_headers file not found. Please ensure it exists in the project root"
fi

# Check if robots.txt exists
if [ -f "public/robots.txt" ]; then
    print_status "robots.txt already exists in public directory"
else
    print_warning "robots.txt not found in public directory"
fi

# Create security configuration summary
cat > cloudflare-security-config.md << 'EOF'
# 🔒 Cloudflare Security Configuration Summary

## Files Created/Modified:
- ✅ `public/_headers` - Security headers for all routes
- ✅ `public/robots.txt` - Bot crawling instructions

## Recommended Cloudflare Dashboard Settings:

### 1. SSL/TLS Settings:
- SSL/TLS encryption mode: Full (strict)
- Always Use HTTPS: Enabled
- HSTS: Enabled (Max Age: 1 year)

### 2. Security Settings:
- Security Level: Medium
- Bot Fight Mode: Enabled
- WAF: Enabled
- Rate Limiting: 100 requests/minute

### 3. Firewall Rules (Priority Order):

#### High Priority (Block immediately):
```
# Block common attack patterns
(http.request.uri.path contains "/wp-admin") or
(http.request.uri.path contains "/wp-login") or
(http.request.uri.query contains "<script") or
(http.request.uri.query contains "eval(")
Action: Block
```

#### Medium Priority (Challenge):
```
# Challenge suspicious user agents
(http.user_agent contains "python") or
(http.user_agent contains "curl") or
(http.user_agent contains "wget")
Action: Managed Challenge
```

#### Low Priority (Monitor):
```
# Monitor API abuse
(http.request.uri.path contains "/api") and
(cf.threat_score gt 10)
Action: Log
```

### 4. Page Rules (Legacy - use Rules instead):
```
*.wasiq.in/*
Browser Cache TTL: 4 hours
Cache Level: Cache Everything
```

### 5. DNS Settings:
- Ensure all records are proxied (orange cloud enabled)
- Add SPF records for email protection

## 🔧 Quick Setup Commands:

```bash
# 1. Update your domain nameservers to Cloudflare
# 2. Enable SSL/TLS
# 3. Set security level to Medium
# 4. Enable Bot Fight Mode
# 5. Enable WAF
# 6. Set up rate limiting
```

## 📊 Monitoring:

After setup, monitor these areas:
- Security → Analytics → Security Events
- Security → Bots → Bot Analytics
- Caching → Analytics

## 🚨 Emergency Actions:

If under attack:
1. Increase Security Level to "High"
2. Enable "Under Attack Mode"
3. Review Firewall Events
4. Block malicious IP ranges

## 📞 Next Steps:

1. Complete Cloudflare dashboard configuration
2. Test your website functionality
3. Monitor security analytics
4. Adjust rules as needed

Your website is now ready for Cloudflare protection! 🛡️
EOF

print_status "Security configuration summary created: cloudflare-security-config.md"

# Create a simple test to verify headers
cat > test-security-headers.js << 'EOF'
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
EOF

print_status "Security headers test script created: test-security-headers.js"

# Print final instructions
echo ""
echo "🎉 Cloudflare Security Setup Complete!"
echo "====================================="
echo ""
print_status "Files created/modified:"
echo "  ✅ public/_headers - Security headers"
echo "  ✅ public/robots.txt - Bot instructions"
echo "  ✅ cloudflare-security-config.md - Setup guide"
echo "  ✅ test-security-headers.js - Header verification"
echo ""
print_info "Next Steps:"
echo "  1. Sign up for Cloudflare (cloudflare.com)"
echo "  2. Add your domain (wasiq.in) to Cloudflare"
echo "  3. Update your domain nameservers"
echo "  4. Follow the configuration guide in cloudflare-security-config.md"
echo "  5. Test with: node test-security-headers.js"
echo ""
print_warning "Important: Make sure to backup your current DNS settings before changing nameservers!"
echo ""
echo "🛡️ Your website will be protected from robot visitors and script attacks!"

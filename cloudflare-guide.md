# 🛡️ Cloudflare Security Configuration Guide

## Prevent Robot Visitors & Script Attacks

This guide will help you configure Cloudflare to protect your website from unwanted robot visitors, script attacks, and malicious traffic.

## 📋 Prerequisites

- Domain name (e.g., `wasiq.in`)
- Access to domain DNS settings
- Cloudflare account (free tier available)

---

## 🚀 Step 1: Sign Up & Add Domain

### 1.1 Create Cloudflare Account
1. Go to [cloudflare.com](https://cloudflare.com)
2. Click "Sign Up" and create a free account
3. Verify your email

### 1.2 Add Your Domain
1. Click "Add Site" in Cloudflare dashboard
2. Enter your domain: `wasiq.in`
3. Cloudflare will scan your DNS records
4. Review and confirm DNS records
5. Update your domain's nameservers:
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Replace current nameservers with Cloudflare's nameservers
   - Example: `ns1.cloudflare.com`, `ns2.cloudflare.com`

---

## 🔒 Step 2: Essential Security Configuration

### 2.1 Enable Bot Management

1. **Go to Security → Bots**
2. **Enable "Bot Management"**
3. **Configure Bot Score**:
   - Set "Block bots with score below": `30`
   - This blocks suspicious bots while allowing good ones

### 2.2 Configure Web Application Firewall (WAF)

1. **Go to Security → WAF**
2. **Enable WAF** (should be on by default)
3. **Set Security Level**: "Medium" or "High"
4. **Enable Rate Limiting**:
   - Go to Security → Rate Limiting
   - Create new rule:
     - **URL Pattern**: `*yourdomain.com/*`
     - **Requests per minute**: `100` (adjust based on your traffic)
     - **Action**: "Block" or "Challenge"

### 2.3 DDoS Protection

1. **Go to Security → DDoS**
2. **Enable "DDoS Protection"** (automatically enabled)
3. **Configure Advanced DDoS Protection** (paid plans)

---

## 🤖 Step 3: Block Unwanted Bots & Scripts

### 3.1 Bot Fight Mode

1. **Go to Security → Bots → Bot Fight Mode**
2. **Enable "Bot Fight Mode"**
3. **Choose "Verified Bots"** to allow good bots (Google, Bing, etc.)

### 3.2 Create Custom Firewall Rules

Go to **Security → WAF → Firewall Rules** and create these rules:

#### Rule 1: Block Common Bad Bots
```
Expression: (http.user_agent contains "bot" and http.user_agent contains "crawl") or (http.user_agent contains "spider") or (http.user_agent contains "scraper")
Action: Block
Description: Block common scraping bots
```

#### Rule 2: Block Script Kiddie Attacks
```
Expression: (http.request.uri.query contains "script") or (http.request.uri.query contains "eval") or (http.request.uri.path contains "wp-admin") or (http.request.uri.path contains "wp-login")
Action: Block
Description: Block script injection attempts
```

#### Rule 3: Block Automated Tools
```
Expression: (http.user_agent contains "python") or (http.user_agent contains "curl") or (http.user_agent contains "wget") or (http.user_agent contains "postman")
Action: Challenge (CAPTCHA)
Description: Challenge automated tools
```

#### Rule 4: Block by Country (Optional)
```
Expression: (ip.src.country eq "CN" or ip.src.country eq "RU" or ip.src.country eq "IN")
Action: Challenge
Description: Challenge traffic from high-risk countries
```

---

## 🔧 Step 4: Advanced Protection Features

### 4.1 Access Rules

1. **Go to Security → WAF → Access Rules**
2. **Create IP-based restrictions**:
   - Block known malicious IP ranges
   - Allow your own IP addresses

### 4.2 Turnstile CAPTCHA

1. **Go to Security → Bots → Turnstile**
2. **Enable Turnstile** for suspicious traffic
3. **Choose "Invisible"** mode for better UX

### 4.3 API Shield (if you have APIs)

1. **Go to Security → API Shield**
2. **Enable API Shield**
3. **Configure Schema Validation**

---

## ⚡ Step 5: Performance & Caching Configuration

### 5.1 Enable Caching

1. **Go to Caching → Configuration**
2. **Browser Cache TTL**: `4 hours`
3. **Cache Level**: "Standard"

### 5.2 Edge Cache

1. **Go to Caching → Cache Rules**
2. **Create rule for static assets**:
   ```
   URI contains: .jpg or .png or .css or .js
   Cache TTL: 1 year
   ```

### 5.3 Compression

1. **Go to Speed → Optimization**
2. **Enable Auto Minify**: HTML, CSS, JS
3. **Enable Brotli compression**

---

## 🔐 Step 6: SSL/TLS Configuration

### 6.1 SSL Setup

1. **Go to SSL/TLS → Overview**
2. **SSL/TLS encryption mode**: "Full (strict)"
3. **Enable Always Use HTTPS**

### 6.2 HSTS

1. **Go to SSL/TLS → Edge Certificates**
2. **Enable HSTS**
3. **Max Age**: `1 year`
4. **Include Subdomains**: Yes

---

## 📊 Step 7: Monitoring & Analytics

### 7.1 Security Analytics

1. **Go to Security → Analytics**
2. **Monitor blocked requests**
3. **Track bot activity**
4. **Review security events**

### 7.2 Firewall Events

1. **Go to Security → Events**
2. **Review blocked traffic**
3. **Analyze attack patterns**

---

## 🛠️ Step 8: Custom Rules for Your Site

Based on your Next.js blog, add these specific rules:

### Admin Protection
```
Expression: http.request.uri.path contains "/admin" and not ip.src in {your-ip-here}
Action: Block
Description: Protect admin routes
```

### API Protection
```
Expression: http.request.uri.path contains "/api" and not cf.bot_management.verified_bot
Action: Challenge
Description: Protect API endpoints from bots
```

### Upload Protection
```
Expression: http.request.uri.path contains "/api/upload" and http.request.method eq "POST"
Action: Managed Challenge
Description: Challenge upload attempts
```

---

## 📝 Quick Setup Checklist

- [ ] Sign up for Cloudflare
- [ ] Add domain to Cloudflare
- [ ] Update nameservers
- [ ] Enable Bot Management
- [ ] Configure WAF rules
- [ ] Set up Rate Limiting
- [ ] Enable DDoS protection
- [ ] Configure SSL/TLS
- [ ] Set up caching
- [ ] Review analytics

---

## 🚨 Emergency Actions

If you suspect an attack:

1. **Go to Security → Events**
2. **Temporarily set Security Level to "High"**
3. **Enable "Under Attack Mode"**
4. **Review and block malicious IPs**

---

## 💡 Pro Tips

1. **Start with Free Plan**: Most features are available on free
2. **Monitor Regularly**: Check analytics weekly
3. **Test Your Rules**: Use different browsers/devices to test
4. **Backup DNS**: Keep original DNS records safe
5. **Gradual Rollout**: Start with medium security, increase as needed

---

## 🔍 Troubleshooting

### Issue: Legitimate traffic blocked
**Solution**: Lower security level or adjust firewall rules

### Issue: Slow loading
**Solution**: Check caching configuration and disable unnecessary rules

### Issue: CAPTCHA appearing too often
**Solution**: Adjust bot score threshold or disable for certain paths

---

## 📞 Support

- **Cloudflare Docs**: [developers.cloudflare.com](https://developers.cloudflare.com)
- **Community**: [community.cloudflare.com](https://community.cloudflare.com)
- **Status**: [cloudflarestatus.com](https://cloudflarestatus.com)

Your website will now be protected from robot visitors and script attacks! 🛡️

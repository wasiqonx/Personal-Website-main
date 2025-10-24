# VPS Deployment Instructions - Fix Prisma Error

## 🚨 Current Issue

Your VPS is showing this error:
```
API Error: TypeError: Cannot read properties of undefined (reading 'create')
at /home/wasiq/resume/Personal-Website-main/.next/server/pages/api/admin/investment-theses.js
```

**Why?** The old compiled code (in `.next` folder) is still running. It has the buggy version with direct `new PrismaClient()` calls.

## ✅ Solution: Deploy the Fixed Code

### Quick Deploy (Automated)

**Step 1:** First, commit and push your local changes:
```bash
# On your Mac (local machine)
cd /Users/wasiq/Projects/Private/Personal-Website-main

# Commit the fixes
git add .
git commit -m "Fix: Use shared Prisma instance in API routes"
git push origin main
```

**Step 2:** Copy the deployment script to your VPS:
```bash
# On your Mac (local machine)
scp deploy-to-vps.sh wasiq@your-vps-ip:/home/wasiq/resume/Personal-Website-main/
```

**Step 3:** SSH into your VPS and run the script:
```bash
# SSH to VPS
ssh wasiq@your-vps-ip

# Navigate to project
cd /home/wasiq/resume/Personal-Website-main

# Make script executable
chmod +x deploy-to-vps.sh

# Run deployment
./deploy-to-vps.sh
```

---

### Manual Deploy (Step-by-Step)

If you prefer to run commands manually:

#### 1. Commit and Push Changes (Local Machine)
```bash
cd /Users/wasiq/Projects/Private/Personal-Website-main
git add .
git commit -m "Fix: Use shared Prisma instance in API routes"
git push origin main
```

#### 2. SSH to VPS
```bash
ssh wasiq@your-vps-ip
```

#### 3. Navigate to Project Directory
```bash
cd /home/wasiq/resume/Personal-Website-main
```

#### 4. Pull Latest Changes
```bash
git pull origin main
```

You should see files being updated:
```
Updating xxxxx..yyyyy
Fast-forward
 pages/api/admin/config.js              | 3 +--
 pages/api/admin/investment-theses.js   | 3 +--
 2 files changed, 2 insertions(+), 4 deletions(-)
```

#### 5. Install Dependencies
```bash
npm install
```

#### 6. Regenerate Prisma Client
```bash
npx prisma generate
```

#### 7. Delete Old Build (IMPORTANT!)
```bash
rm -rf .next
```
**Why?** The `.next` folder contains the old compiled code with the bug. Deleting it forces a fresh rebuild.

#### 8. Build Application
```bash
npm run build
```

This will take 1-2 minutes. Wait for it to complete.

#### 9. Restart PM2
```bash
pm2 stop Wasiq
pm2 delete Wasiq
pm2 start npm --name "Wasiq" -- run start
pm2 save
```

#### 10. Verify Deployment
```bash
# Check PM2 status
pm2 status

# Watch logs (Ctrl+C to exit)
pm2 logs Wasiq --lines 50
```

**✅ Success indicators:**
- PM2 shows status "online"
- No "Cannot read properties of undefined" errors in logs
- You see normal request logs

**❌ If you still see errors:**
- Database might not be accessible
- DATABASE_URL might be wrong
- See troubleshooting below

---

## 🔍 Verification Tests

After deployment, test the APIs:

### Test 1: Config API
```bash
curl http://localhost:3000/api/admin/config
```

**Expected:** JSON response with investment thesis label
```json
{
  "id": "...",
  "investmentThesesLabel": "Investment Theses",
  "updatedAt": "..."
}
```

### Test 2: Investment Theses API
```bash
curl http://localhost:3000/api/admin/investment-theses
```

**Expected:** JSON array (might be empty)
```json
[]
```

**NOT Expected:** Error message or HTML error page

---

## 🐛 Troubleshooting

### Error: "Cannot read properties of undefined"

**Cause:** Old build still being used

**Fix:**
```bash
# Force complete rebuild
rm -rf .next
rm -rf node_modules
npm install
npx prisma generate
npm run build
pm2 restart Wasiq
```

### Error: "DATABASE_URL not found"

**Cause:** Environment variable not set

**Fix:**
```bash
# Check if .env exists
cat .env

# If not, create it:
cat > .env << 'EOF'
DATABASE_URL="file:./prisma/prod.db"
NODE_ENV=production
EOF

# Restart
pm2 restart Wasiq
```

### Error: "ENOENT: no such file or directory"

**Cause:** Database file doesn't exist

**Fix:**
```bash
# Check if database exists
ls -la prisma/prod.db

# If not, run migrations
npx prisma migrate deploy

# Create admin user
node scripts/create-admin.js "admin@example.com" "admin" "YourPassword123"
```

### Error: "port 3000 already in use"

**Cause:** Old process still running

**Fix:**
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or find and kill manually
ps aux | grep next
kill -9 <process-id>

# Restart PM2
pm2 restart Wasiq
```

---

## 📊 What Changed

| File | Change | Impact |
|------|--------|--------|
| `pages/api/admin/config.js` | Changed to `import prisma from '../../../lib/db'` | Fixes undefined Prisma error |
| `pages/api/admin/investment-theses.js` | Changed to `import prisma from '../../../lib/db'` | Fixes undefined Prisma error |

**Why this matters:**
- **Before:** Each API request created a new Prisma instance → failures on production
- **After:** All APIs share one Prisma instance → stable and reliable

---

## 📝 Post-Deployment Checklist

- [ ] Git changes pushed to repository
- [ ] VPS pulled latest code
- [ ] Dependencies installed
- [ ] Prisma client regenerated
- [ ] Old `.next` folder deleted
- [ ] Application rebuilt
- [ ] PM2 restarted
- [ ] No errors in PM2 logs
- [ ] APIs return valid JSON responses
- [ ] Website loads correctly

---

## 🎯 Quick Command Reference

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs Wasiq

# Restart application
pm2 restart Wasiq

# Stop application
pm2 stop Wasiq

# View last 50 log lines
pm2 logs Wasiq --lines 50

# Monitor logs in real-time
pm2 logs Wasiq --lines 0

# Check if port is in use
lsof -ti:3000

# Test API
curl http://localhost:3000/api/admin/config
```

---

## 🆘 Getting Help

If issues persist after following these steps:

1. **Check PM2 logs:**
   ```bash
   pm2 logs Wasiq --lines 100
   ```

2. **Check environment:**
   ```bash
   cat .env
   ls -la prisma/
   ```

3. **Verify Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Test database connection:**
   ```bash
   npx prisma studio
   # Open in browser to verify database works
   ```

---

**Remember:** Always delete the `.next` folder when updating API code to ensure changes take effect! 🚀


# VPS Deployment Fix - Prisma Client Error

## 🔴 Error on VPS

You were getting this error in PM2 logs:

```
API Error: TypeError: Cannot read properties of undefined (reading 'findFirst')
at c (/home/wasiq/resume/Personal-Website-main/.next/server/pages/api/admin/config.js:1:994)
```

## 🔍 Root Cause

The issue was in two API files:
- `pages/api/admin/config.js`
- `pages/api/admin/investment-theses.js`

Both files were creating **new PrismaClient instances** directly:
```javascript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()  // ❌ Wrong - causes initialization issues
```

In production/VPS, this causes:
- Multiple unmanaged Prisma instances
- Connection pooling issues
- Memory leaks
- Undefined Prisma errors

## ✅ Solution Applied

Changed both files to use the **shared Prisma instance** from `lib/db.js`:

```javascript
import prisma from '../../../lib/db'  // ✅ Correct - reuses shared instance
```

The `lib/db.js` file already handles:
- Singleton pattern (only one instance)
- Proper connection pooling
- Memory management
- Development logging

## 📁 Files Fixed

```
✅ pages/api/admin/config.js
   - Changed: import { PrismaClient } from '@prisma/client'
   - To:      import prisma from '../../../lib/db'
   - Removed: const prisma = new PrismaClient()

✅ pages/api/admin/investment-theses.js
   - Changed: import { PrismaClient } from '@prisma/client'
   - To:      import prisma from '../../../lib/db'
   - Removed: const prisma = new PrismaClient()
```

## 🚀 Deployment Steps for VPS

### Step 1: Pull Latest Changes
```bash
cd /home/wasiq/resume/Personal-Website-main
git pull origin main
```

### Step 2: Rebuild Next.js
```bash
npm install
npm run build
```

### Step 3: Restart PM2
```bash
pm2 delete Wasiq
pm2 start npm --name "Wasiq" -- run start
pm2 save
```

### Step 4: Verify No Errors
```bash
pm2 logs Wasiq
# Should NOT see "Cannot read properties of undefined (reading 'findFirst')"
```

## 📊 What Changed

| Aspect | Before | After |
|--------|--------|-------|
| Prisma Instances | Multiple (1 per API call) | Single shared instance |
| Connection Pooling | Broken | Proper pooling |
| Memory Usage | Growing leak | Stable |
| Error Rate | High (Prisma undefined) | Fixed |

## ⚠️ Why This Matters

Creating a new `PrismaClient()` for each request is an **anti-pattern**:

1. **Resource Leaks**: Each instance opens new connections that aren't properly cleaned up
2. **Connection Pool Exhaustion**: Database connections max out quickly
3. **Undefined Errors**: Prisma might not initialize properly in production
4. **Performance Degradation**: Each request initialization adds overhead

The correct pattern (what we're using now in `lib/db.js`):
- Single instance per process
- Reused across all API routes
- Proper singleton pattern
- Global instance in development mode

## 🔧 Future Prevention

When creating new API endpoints, **always use**:

```javascript
// ✅ CORRECT
import prisma from '../../../lib/db'

export default async function handler(req, res) {
  const users = await prisma.user.findMany()
  return res.json(users)
}
```

**NOT**:
```javascript
// ❌ WRONG - Don't do this!
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  const users = await prisma.user.findMany()
  return res.json(users)
}
```

## 🎯 Expected Results After Fix

- ✅ No more "Cannot read properties of undefined" errors
- ✅ Investment Theses API works on VPS
- ✅ Admin config API works on VPS
- ✅ Stable memory usage
- ✅ Better performance

## 📝 Testing

After deployment, test these endpoints:

```bash
# Test getting investment theses
curl http://your-vps-domain.com/api/admin/investment-theses

# Test getting config
curl http://your-vps-domain.com/api/admin/config

# Both should return valid JSON, not errors
```

## 🆘 If Issues Persist

1. Check PM2 logs: `pm2 logs Wasiq`
2. Verify DATABASE_URL is set correctly on VPS
3. Ensure database file exists and is accessible
4. Check file permissions: `ls -la /path/to/database`
5. Regenerate Prisma client: `npx prisma generate`

---

**Summary**: Fixed Prisma client initialization error by using shared instance pattern. Deploy and restart your VPS application. ✅

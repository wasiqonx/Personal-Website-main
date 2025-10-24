# ❌ Login Issue - Database Path Mismatch

## Problem Identified

You're getting `401 Unauthorized` errors when trying to login because of a **DATABASE_URL mismatch**:

- `.env` file has: `DATABASE_URL="file:./dev.db"` (project root)
- `.env.local` file has: `DATABASE_URL="file:./prisma/dev.db"` (correct location)
- Your user data is in: `./prisma/dev.db`

When you run `npm run dev`, Next.js loads both files, but `.env` values take precedence, causing the app to look for the database in the wrong location!

## ✅ Solution

### Step 1: Verify Your Current Setup

```bash
# Check which database files exist
ls -lah prisma/dev.db    # Should exist (has user data)
ls -lah dev.db           # Should NOT exist (wrong location)
```

### Step 2: Fix the .env File

Since `.env` is git-ignored and you can't edit it directly through the interface, do this:

**Option A: Edit via Terminal (Recommended)**
```bash
cd /Users/wasiq/Projects/Private/Personal-Website-main

# Backup the old .env
cp .env .env.backup

# Create new .env with correct DATABASE_URL
cat > .env << 'EOF'
# Database - FIXED TO CORRECT LOCATION
DATABASE_URL="file:./prisma/dev.db"

# JWT Secret for authentication
JWT_SECRET=41105cbcd390a9d2a7a04666cebe60f16f206fb627b4b03495f9f19753fb003617b26fb79d2ed79d70ba63a48f817948545ea0a15ebba1a847f3e01ddbdf9fee

# hCaptcha Configuration
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your-hcaptcha-site-key
HCAPTCHA_SECRET_KEY=your-hcaptcha-secret-key
EOF

echo "✅ .env file updated!"
```

**Option B: If using VS Code**
1. Open `.env` file in your editor
2. Change line 2 from `DATABASE_URL="file:./dev.db"` to `DATABASE_URL="file:./prisma/dev.db"`
3. Save the file

### Step 3: Verify Your Login Credentials

You created a user with these credentials:
```
Email:    wasiq@wasiq.in
Username: Admin
Password: NewPassword123
```

Or the fallback credentials:
```
Email:    admin@example.com
Username: admin
Password: Admin@123
```

### Step 4: Restart Everything

```bash
# Stop the current dev server (Ctrl+C)

# Clear Next.js cache
rm -rf .next

# Start fresh
npm run dev
```

Then try logging in with:
- **Email**: wasiq@wasiq.in
- **Password**: NewPassword123

OR

- **Email**: admin@example.com
- **Password**: Admin@123

## 🔍 Verify the Fix

After making the change, you can verify the database is correctly accessed:

```bash
# Check if login API can find the user
DATABASE_URL="file:./prisma/dev.db" node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany().then(users => {
  console.log('✅ Database accessible!');
  console.log('Users found:', users.length);
  users.forEach(u => console.log('  -', u.email, '(admin:', u.isAdmin, ')'));
  process.exit(0);
}).catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
"
```

## 📋 Checklist

- [ ] Backed up `.env` file
- [ ] Changed DATABASE_URL in `.env` to `file:./prisma/dev.db`
- [ ] Saved the `.env` file
- [ ] Stopped dev server
- [ ] Deleted `.next` folder
- [ ] Restarted with `npm run dev`
- [ ] Tried logging in with correct credentials
- [ ] ✅ Login works!

## 🎯 If Still Not Working

1. **Verify the database file exists:**
   ```bash
   ls -lah prisma/dev.db
   ```

2. **Check if user data is in the database:**
   ```bash
   DATABASE_URL="file:./prisma/dev.db" npx prisma studio
   # Open http://localhost:5555 and check User table
   ```

3. **Check environment variables are loaded:**
   In browser console or server logs, look for which DATABASE_URL is being used

4. **Check .env file contents:**
   ```bash
   cat .env | grep DATABASE_URL
   ```
   Should show: `DATABASE_URL="file:./prisma/dev.db"`

5. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

## 🔐 Login Test Steps

1. Open http://localhost:3000
2. Click login or navigate to `/auth/login`
3. Enter credentials:
   - Email: `wasiq@wasiq.in`
   - Password: `NewPassword123`
4. Click "Login"
5. You should be redirected to `/admin` ✅

## 📝 Notes

- The `.env` file is git-ignored for security reasons
- Always keep DATABASE_URL pointing to `file:./prisma/dev.db`
- `.env.local` is for local overrides (but `.env` takes precedence when both exist)
- JWT_SECRET should be kept private and not committed to git

## 🆘 Still Having Issues?

If login still doesn't work after fixing DATABASE_URL:

1. Create a fresh user:
   ```bash
   export DATABASE_URL="file:./prisma/dev.db"
   node scripts/create-admin.js "test@example.com" "testuser" "TestPass123"
   ```

2. Try logging in with the new credentials

3. Check server logs for error messages (look for "Login error" or database connection errors)

---

**Key Takeaway**: The `.env` file MUST point to `file:./prisma/dev.db` for the database to work correctly!

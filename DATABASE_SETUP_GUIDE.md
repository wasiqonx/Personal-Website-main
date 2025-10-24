# Database Setup Guide

## 🗄️ What Was Wrong?

Your Prisma Studio showed an empty database because:
1. ✅ Database was successfully created by migrations
2. ✅ All tables were created (User, Post, Comment, InvestmentThesis, SiteConfig, etc.)
3. ❌ **NO DATA** - The database had no users or posts yet
4. ❌ You need to manually create at least one admin user to start using the system

## ✅ Current Status

After running the setup script:
- ✅ Admin user created: `admin` / `admin@example.com`
- ✅ SiteConfig initialized with default label "Investment Theses"
- ✅ All tables ready for use

## 📝 Creating Admin Users

### Method 1: Using the Create Admin Script (Recommended)

```bash
export DATABASE_URL="file:./prisma/dev.db"
node scripts/create-admin.js <email> <username> <password>
```

**Example:**
```bash
node scripts/create-admin.js "admin@example.com" "admin" "MySecurePassword123"
node scripts/create-admin.js "wasiq@example.com" "wasiq" "SecurePass456"
```

**What it does:**
- ✅ Validates input
- ✅ Hashes password with bcrypt (12 rounds)
- ✅ Generates unique JWT secret
- ✅ Creates admin user with full permissions
- ✅ Checks for duplicates
- ✅ Shows confirmation with user details

### Method 2: Direct User Creation with Prisma Studio

1. Start Prisma Studio:
```bash
export DATABASE_URL="file:./prisma/dev.db"
npx prisma studio --port 5555
```

2. Open `http://localhost:5555` in browser
3. Click on "User" table
4. Click "Add record"
5. Fill in fields:
   - `email`: your@email.com
   - `username`: yourname
   - `password`: *(hashed value - not recommended)*
   - `jwtSecret`: *(auto-generated)*
   - `isAdmin`: toggle to `true`

**⚠️ Note**: Direct creation in Studio won't hash the password. Use the script instead!

## 🔑 Login Credentials

After setup, use these to login:
- **Email**: admin@example.com
- **Username**: admin
- **Password**: Admin@123

### To Change Credentials Later

Create another admin user with preferred credentials:
```bash
node scripts/create-admin.js "newemail@example.com" "newusername" "NewPassword123"
```

Then delete the old user via Prisma Studio if needed.

## 📊 Database Structure

### User Table
```prisma
{
  id         -> Unique identifier (cuid)
  email      -> Unique email address
  username   -> Unique username
  password   -> Bcrypt hashed password
  jwtSecret  -> Individual JWT secret for tokens
  isAdmin    -> Boolean (true/false)
  createdAt  -> Account creation date
  updatedAt  -> Last updated date
}
```

### SiteConfig Table
```prisma
{
  id                     -> Unique identifier
  investmentThesesLabel  -> Section name (default: "Investment Theses")
  updatedAt              -> Last updated date
}
```

### Other Tables (Auto-created by migrations)
- **Post** - Blog posts
- **Comment** - Blog comments
- **Tag** - Post tags
- **MediaFile** - Uploaded images/videos
- **InvestmentThesis** - Investment documents

## 🚀 Accessing Different Parts of the System

### Admin Dashboard
- **URL**: `/admin`
- **Login**: admin@example.com / Admin@123
- **Access**: All admin features
  - 📝 Blog posts
  - 💬 Comments
  - 📄 Investment theses
  - ⚙️ Settings

### Public Pages (No Login Required)
- **Projects**: `/projects`
- **Blog**: `/blog`
- **Investment Theses**: `/investment-theses`
- **Profile**: `/profile`
- **Resume**: `/resume`

### Create New Admin
```bash
export DATABASE_URL="file:./prisma/dev.db"
node scripts/create-admin.js "anotheremail@example.com" "anotheruser" "AnotherPass789"
```

## 🔍 Checking Database Status

### View All Users
```bash
export DATABASE_URL="file:./prisma/dev.db"
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany({
  select: {
    id: true,
    email: true,
    username: true,
    isAdmin: true
  }
}).then(users => {
  console.log('Users:', JSON.stringify(users, null, 2));
  process.exit(0);
});
"
```

### View Database Stats
```bash
export DATABASE_URL="file:./prisma/dev.db"
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function stats() {
  const users = await prisma.user.count();
  const posts = await prisma.post.count();
  const comments = await prisma.comment.count();
  const theses = await prisma.investmentThesis.count();
  
  console.log('Database Stats:');
  console.log('  Users:', users);
  console.log('  Posts:', posts);
  console.log('  Comments:', comments);
  console.log('  Investment Theses:', theses);
  
  process.exit(0);
}

stats();
"
```

## 🛠️ Troubleshooting

### Problem: "No DATABASE_URL set"
**Solution**: Set environment variable before running commands:
```bash
export DATABASE_URL="file:./prisma/dev.db"
```

### Problem: "User with email/username already exists"
**Solution**: Use different email/username or delete existing user in Prisma Studio

### Problem: Can't login with created credentials
**Solution**: 
1. Verify user was created: Use database stats command above
2. Check email/username spelling
3. Create new user with new credentials

### Problem: Prisma Studio won't start
**Solution**: 
```bash
# Make sure environment is set
export DATABASE_URL="file:./prisma/dev.db"

# Try on different port
npx prisma studio --port 5556
```

## 📋 Quick Commands Reference

```bash
# Set up environment
export DATABASE_URL="file:./prisma/dev.db"

# Create admin user
node scripts/create-admin.js "email@example.com" "username" "password"

# View database with GUI
npx prisma studio --port 5555

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Reset database (⚠️ DESTRUCTIVE - deletes all data)
npx prisma migrate reset
```

## 🔐 Security Best Practices

1. **Use Strong Passwords**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Example: `MyP@ssw0rd2025!`

2. **Keep Credentials Safe**
   - Don't commit credentials to git
   - Use environment variables in production
   - Rotate passwords regularly

3. **JWT Secrets**
   - Automatically generated for each user
   - Unique per user (not shared)
   - Used for signing authentication tokens

4. **Password Hashing**
   - All passwords hashed with bcrypt (12 rounds)
   - Never stored in plain text
   - One-way encryption

## 📖 Next Steps

1. ✅ Create admin user (Done!)
2. 🌐 Run development server: `npm run dev`
3. 🔑 Login at `/auth/login`
4. 📝 Create blog posts in admin panel
5. 📄 Add investment theses
6. 📝 Customize section labels

## 🎯 Common Workflows

### Add New Blog Post
1. Login at `/auth/login`
2. Go to `/admin/posts/new`
3. Fill in title, content, optional media
4. Publish or save as draft
5. View on `/blog`

### Add Investment Thesis
1. Login at `/auth/login`
2. Go to `/admin/investment-theses/new`
3. Enter title and PDF URL (HTTPS only, must end with .pdf)
4. Submit
5. View on `/investment-theses`

### Customize Section Label
1. Login at `/auth/login`
2. Go to `/admin/investment-theses`
3. Click "Edit Label"
4. Enter new name (1-100 characters)
5. Save
6. Changes appear immediately on all pages

## 📞 Support

For issues related to:
- **User creation**: Check `scripts/create-admin.js`
- **Database schema**: Check `prisma/schema.prisma`
- **Migrations**: Check `prisma/migrations/`
- **Authentication**: Check `lib/auth.js`

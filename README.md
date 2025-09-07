# Personal-Website

A quality portfolio site with a beautiful and simple design that you can personalize for yourself.

## 🔒 Security Features

This project includes several security measures to protect your data:

### Database Security
- SQLite database with environment variable configuration
- Database files excluded from version control
- Production logging minimized (errors only)
- Separate database files for development/production

### Authentication Security
- JWT-based authentication with individual user secrets
- Cookie consent required for login
- 4-hour sessions for non-cookie-consent users
- 7-day sessions for cookie-consent users
- Automatic logout on cookie consent revocation

### Comment Protection
- **🤖 AI-Powered Auto-Moderation**:
  - Auto-approves constructive criticism
  - Auto-rejects inappropriate content and suspicious links
  - Manual review for neutral content
- Admin approval system for flagged comments

### Prisma Studio Protection
- Blocked from running in production
- Warning scripts prevent accidental exposure
- Port 5555 not exposed in production builds

## 🚀 Quick Start

### Development
```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

### Production Deployment
```bash
# 1. Set environment variables
cp .env .env.production
# Edit .env.production with production values

# 2. Build for production
npm run build
npm run start

# 3. Database management (development only)
npm run studio:dev  # Opens Prisma Studio on port 5555
npm run db:migrate  # Run migrations
npm run db:push     # Push schema changes

# 4. Security check
npm run security:check
```

## 🔐 Environment Variables

### Required Variables
```env
DATABASE_URL="file:./prod.db"
JWT_SECRET="your-secure-jwt-secret"
NODE_ENV=production
```

### Security Best Practices
- Use different database files for dev/prod
- Generate unique JWT secrets for production
- Keep environment files out of version control
- Never run `prisma studio` in production

## 📊 Database Management

### Development Only Commands
```bash
npm run studio:dev    # Opens Prisma Studio (port 5555)
npm run db:migrate    # Create and run migrations
npm run db:push       # Push schema changes to database
npm run db:generate   # Generate Prisma client
npm run db:seed       # Seed database with admin user
```

### Production Safety
```bash
npm run studio        # Shows warning - NEVER run in production!
npm run security:check # Verify security configuration
```

## 🛡️ Security Checklist

- [ ] Database files excluded from git
- [ ] Environment variables configured
- [ ] Unique JWT secret for production
- [ ] Separate database for production
- [ ] Prisma Studio not running in production
- [ ] Production logging minimized
- [ ] Cookie consent system active

<hr>
<h1>Support: https://discord.gg/codes</h1><br>
<h1><a href="https://codeshare.me" rel="follow" >Code Share</a></h1>

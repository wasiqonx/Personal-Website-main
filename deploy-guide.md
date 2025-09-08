# 🚀 VPS Deployment Guide - Fix MIME Type Errors

## Problem
Your VPS is showing MIME type errors because the Next.js static files aren't being served properly. This happens when the build process isn't run on the VPS or the `.next` directory isn't deployed.

## Solution Steps

### 1. SSH into your VPS
```bash
ssh your-vps-server
cd /path/to/your/app
```

### 2. Pull Latest Changes
```bash
git pull origin main
```

### 3. Install Dependencies (if needed)
```bash
npm install
```

### 4. Clean Previous Build
```bash
# Stop the application first
pm2 stop Wasiq

# Remove old build files
rm -rf .next
```

### 5. Build the Application
```bash
npm run build
```

### 6. Verify Build Success
After build completes, check that these files exist:
```bash
ls -la .next/static/
ls -la .next/static/*/  # Should show _buildManifest.js and _ssgManifest.js
```

### 7. Start/Restart Application
```bash
# Start with PM2
npm run start

# Or restart existing process
pm2 restart Wasiq
```

### 8. Check Application Status
```bash
# Check if app is running
pm2 status

# Check logs for any errors
pm2 logs Wasiq --lines 20
```

## Alternative: Automated Deployment Script

Create this script on your VPS for easier deployments:

```bash
#!/bin/bash
echo "🚀 Deploying Personal Website..."

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Clean and rebuild
rm -rf .next
npm run build

# Check build success
if [ -d ".next/static" ]; then
    echo "✅ Build successful!"
    pm2 restart Wasiq
    echo "🚀 Application restarted!"
else
    echo "❌ Build failed!"
    exit 1
fi
```

Save as `deploy.sh`, make executable: `chmod +x deploy.sh`

Then run: `./deploy.sh`

## Common Issues & Solutions

### Issue: Still getting MIME errors after build
**Solution**: Make sure `.next` directory is included in your deployment and not in `.gitignore`

### Issue: Build succeeds but static files missing
**Solution**: Check that you're running `npm run build` in the correct directory

### Issue: PM2 not restarting properly
**Solution**:
```bash
pm2 delete Wasiq
pm2 start npm --name "Wasiq" -- start
```

### Issue: Permission errors
**Solution**:
```bash
sudo chown -R $USER:$USER /path/to/your/app
```

## Verification Steps

1. **Check static files exist**:
   ```bash
   ls -la .next/static/chunks/pages/
   # Should show index-*.js and other page bundles
   ```

2. **Test application**:
   ```bash
   curl -I http://localhost:3000
   # Should return 200 OK
   ```

3. **Check browser console**:
   - Open your site in browser
   - Open DevTools → Console
   - Should not see MIME type errors

## Prevention

To prevent this issue in future deployments:

1. **Always run build on VPS**: Never deploy without running `npm run build`
2. **Include .next in deployment**: Make sure your deployment process copies the `.next` directory
3. **Use deployment script**: Automate the build process
4. **Monitor logs**: Regularly check PM2 logs for errors

## Quick Fix (if you have SSH access)

If you can SSH into your VPS right now:

```bash
ssh your-vps
cd /path/to/your/website
pm2 stop Wasiq
rm -rf .next
npm run build
pm2 start npm --name "Wasiq" -- start
pm2 logs Wasiq --lines 10
```

This should fix the MIME type errors immediately!



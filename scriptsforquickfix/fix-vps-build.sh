#!/bin/bash

echo "🔧 Fixing Next.js MIME Type Errors on VPS..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the correct directory. Please run this script from your app root."
    exit 1
fi

# Stop the application
echo "🛑 Stopping application..."
pm2 stop Wasiq 2>/dev/null || echo "App wasn't running"

# Clean old build
echo "🧹 Cleaning old build files..."
rm -rf .next

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ ! -d ".next/static" ]; then
    echo "❌ Build failed! Check the output above for errors."
    exit 1
fi

# Verify static files exist
echo "✅ Verifying static files..."
ls -la .next/static/ | head -5

# Start the application
echo "🚀 Starting application..."
npm run start

# Check status
sleep 3
echo "📊 Application status:"
pm2 status | grep Wasiq

echo ""
echo "🎉 Fix complete!"
echo "📝 Check your website - MIME type errors should be resolved!"
echo "🔍 Monitor logs with: pm2 logs Wasiq --lines 10"



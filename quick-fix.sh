#!/bin/bash

echo "🚀 Quick Next.js Development Server Fix"
echo "====================================="

# Stop any running processes
pkill -f "next dev" 2>/dev/null

# Clear all caches
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc

# Clear npm cache
npm cache clean --force 2>/dev/null

# Clear browser temp files
find . -name "*.hot-update.json" -delete 2>/dev/null

# Reinstall dependencies
npm install

# Start fresh
echo "Starting development server..."
npm run dev

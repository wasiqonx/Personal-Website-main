#!/bin/bash

# Deploy to VPS - Complete rebuild script
# This script rebuilds the application after code changes

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          Deploying Personal Website to VPS                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Exit on any error
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Navigate to project directory
echo -e "${YELLOW}Step 1: Navigating to project directory${NC}"
cd /home/wasiq/resume/Personal-Website-main || exit 1
echo -e "${GREEN}✓ In project directory${NC}"
echo ""

# Step 2: Pull latest changes from Git
echo -e "${YELLOW}Step 2: Pulling latest changes from Git${NC}"
git pull origin main
echo -e "${GREEN}✓ Code updated${NC}"
echo ""

# Step 3: Install/Update dependencies
echo -e "${YELLOW}Step 3: Installing dependencies${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 4: Generate Prisma Client
echo -e "${YELLOW}Step 4: Generating Prisma Client${NC}"
npx prisma generate
echo -e "${GREEN}✓ Prisma Client generated${NC}"
echo ""

# Step 5: Delete old build
echo -e "${YELLOW}Step 5: Deleting old build${NC}"
rm -rf .next
echo -e "${GREEN}✓ Old build deleted${NC}"
echo ""

# Step 6: Build Next.js application
echo -e "${YELLOW}Step 6: Building Next.js application${NC}"
npm run build
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# Step 7: Stop PM2 process
echo -e "${YELLOW}Step 7: Stopping PM2 process${NC}"
pm2 stop Wasiq || echo "Process not running"
pm2 delete Wasiq || echo "Process not found"
echo -e "${GREEN}✓ PM2 process stopped${NC}"
echo ""

# Step 8: Start PM2 process
echo -e "${YELLOW}Step 8: Starting PM2 process${NC}"
pm2 start npm --name "Wasiq" -- run start
echo -e "${GREEN}✓ PM2 process started${NC}"
echo ""

# Step 9: Save PM2 configuration
echo -e "${YELLOW}Step 9: Saving PM2 configuration${NC}"
pm2 save
echo -e "${GREEN}✓ PM2 configuration saved${NC}"
echo ""

# Step 10: Show PM2 status
echo -e "${YELLOW}Step 10: PM2 Status${NC}"
pm2 status
echo ""

# Step 11: Show recent logs
echo -e "${YELLOW}Step 11: Recent logs (last 20 lines)${NC}"
pm2 logs Wasiq --lines 20 --nostream
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ DEPLOYMENT COMPLETE                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "  1. Monitor logs: pm2 logs Wasiq"
echo "  2. Check status: pm2 status"
echo "  3. Test API: curl http://localhost:3000/api/admin/config"
echo ""
echo -e "${YELLOW}If you see errors:${NC}"
echo "  - Check DATABASE_URL is set correctly"
echo "  - Verify database file exists and is accessible"
echo "  - Check file permissions"
echo ""


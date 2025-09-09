#!/bin/bash

echo "🚀 Deploying Cloudflare Optimizations..."
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "pages" ]; then
    print_error "Please run this script from your Next.js project root directory"
    exit 1
fi

print_info "Pulling latest changes from repository..."
if git pull origin main; then
    print_status "Repository updated successfully"
else
    print_error "Failed to pull from repository"
    exit 1
fi

print_info "Installing dependencies..."
if npm install; then
    print_status "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi

print_info "Building application with Cloudflare optimizations..."
if npm run build; then
    print_status "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

print_info "Checking PM2 process..."
if pm2 describe Wasiq > /dev/null 2>&1; then
    print_info "Restarting PM2 process..."
    if pm2 restart Wasiq; then
        print_status "Application restarted"
    else
        print_error "Failed to restart application"
        exit 1
    fi
else
    print_warning "PM2 process 'Wasiq' not found"
    print_info "Starting new PM2 process..."
    if npm run start; then
        print_status "Application started"
    else
        print_error "Failed to start application"
        exit 1
    fi
fi

print_info "Waiting for application to start..."
sleep 5

print_info "Checking application status..."
if pm2 status | grep -q "Wasiq.*online"; then
    print_status "Application is running successfully"
else
    print_warning "Application status unclear - please check manually"
fi

print_info "Testing application health..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    print_status "Application responding correctly"
else
    print_warning "Application not responding - please check logs"
fi

echo ""
echo "🎉 Cloudflare optimizations deployed!"
echo "==================================="
echo ""
print_status "Updated Features:"
echo "  ✅ Next.js config optimized for Cloudflare"
echo "  ✅ Security headers enhanced"
echo "  ✅ Image optimization improved"
echo "  ✅ Bundle splitting optimized"
echo "  ✅ Compression enabled"
echo ""
print_info "Next Steps:"
echo "  1. Verify your Cloudflare dashboard is configured"
echo "  2. Test your website: https://wasiq.in"
echo "  3. Check Cloudflare analytics for traffic patterns"
echo "  4. Monitor PM2 logs: pm2 logs Wasiq"
echo ""
print_warning "Don't forget to:"
echo "  - Complete Cloudflare WAF rules setup"
echo "  - Update your domain nameservers"
echo "  - Enable SSL/TLS in Cloudflare"
echo ""
echo "🛡️ Your site is now optimized for Cloudflare protection!"

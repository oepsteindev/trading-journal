#!/bin/bash

echo "🚀 Trading Dashboard - Netlify Deploy Script"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} npm version: $(npm --version)"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Build the project
echo -e "${BLUE}🔨 Building project...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Build successful!"
    echo ""
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo -e "${BLUE}📦 Installing Netlify CLI...${NC}"
    npm install -g netlify-cli
    echo ""
fi

# Check if user is logged in to Netlify
echo -e "${BLUE}🔐 Checking Netlify authentication...${NC}"
netlify status &> /dev/null

if [ $? -ne 0 ]; then
    echo "You need to login to Netlify first."
    echo "This will open your browser..."
    netlify login
    echo ""
fi

# Deploy
echo -e "${BLUE}🚀 Deploying to Netlify...${NC}"
echo ""

netlify deploy --prod --dir=build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=====================================${NC}"
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo -e "${GREEN}=====================================${NC}"
    echo ""
    echo "Your trading dashboard is now live!"
    echo ""
    echo "Next steps:"
    echo "  1. Open the URL above in your browser"
    echo "  2. Upload your TradingView CSV"
    echo "  3. Analyze your trades!"
    echo ""
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

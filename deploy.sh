#!/bin/bash

# Walrus Model Hub - Contract Deployment Script
# This script deploys the smart contract and automatically updates the frontend configuration

set -e  # Exit on error

echo "📦 Walrus Model Hub - Contract Deployment Script"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Parse command line arguments
DEPLOY_CONTRACT=true
RESTART_FRONTEND=true

show_help() {
    echo "Usage: ./deploy.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -c, --contract-only      Only deploy smart contract (skip frontend restart)"
    echo "  -f, --frontend-only      Only restart frontend server (skip contract deployment)"
    echo "  -s, --skip-frontend      Deploy contract but don't restart frontend"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh              # Deploy contract + restart frontend (default)"
    echo "  ./deploy.sh -c           # Only deploy contract"
    echo "  ./deploy.sh -f           # Only restart frontend"
    echo "  ./deploy.sh -s           # Deploy contract without restarting frontend"
    echo ""
    exit 0
}

for arg in "$@"; do
    case $arg in
        -c|--contract-only)
            RESTART_FRONTEND=false
            ;;
        -f|--frontend-only)
            DEPLOY_CONTRACT=false
            ;;
        -s|--skip-frontend)
            RESTART_FRONTEND=false
            ;;
        -h|--help)
            show_help
            ;;
        *)
            echo -e "${RED}Unknown option: $arg${NC}"
            echo "Use --help or -h to see available options"
            exit 1
            ;;
    esac
done

# Function to restart frontend
restart_frontend() {
    echo ""
    echo -e "${BLUE}🔄 Restarting Next.js development server...${NC}"
    
    cd web
    
    # Find and kill existing Next.js process
    NEXTJS_PID=$(lsof -ti:3000 2>/dev/null || true)
    
    if [ ! -z "$NEXTJS_PID" ]; then
        echo -e "${YELLOW}⚠️  Stopping existing Next.js server (PID: $NEXTJS_PID)...${NC}"
        kill $NEXTJS_PID 2>/dev/null || true
        sleep 2
    fi
    
    # Start Next.js in background
    echo -e "${BLUE}🚀 Starting Next.js development server...${NC}"
    nohup npm run dev > /tmp/walrus-nextjs.log 2>&1 &
    NEXTJS_NEW_PID=$!
    
    # Wait a moment and check if process is running
    sleep 3
    if ps -p $NEXTJS_NEW_PID > /dev/null; then
        echo -e "${GREEN}✅ Next.js server started successfully (PID: $NEXTJS_NEW_PID)${NC}"
        echo -e "${BLUE}📝 Server logs: tail -f /tmp/walrus-nextjs.log${NC}"
        echo -e "${BLUE}🌐 Visit: http://localhost:3000${NC}"
    else
        echo -e "${RED}❌ Failed to start Next.js server${NC}"
        echo -e "${YELLOW}Check logs: cat /tmp/walrus-nextjs.log${NC}"
        exit 1
    fi
    
    cd ..
}

# Handle frontend-only mode
if [ "$DEPLOY_CONTRACT" = false ]; then
    restart_frontend
    echo ""
    echo "================================================"
    echo -e "${GREEN}✨ Frontend Restart Complete!${NC}"
    echo "================================================"
    exit 0
fi

# Check if sui CLI is installed
if ! command -v sui &> /dev/null; then
    echo -e "${RED}❌ Error: sui CLI is not installed${NC}"
    echo "Please install Sui CLI first: https://docs.sui.io/guides/developer/getting-started/sui-install"
    exit 1
fi

# Navigate to contract directory
cd walrus_model_hub

echo -e "${BLUE}🔨 Building contract...${NC}"
sui move build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Contract build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contract built successfully${NC}"
echo ""

# Deploy contract
echo -e "${BLUE}🚀 Deploying contract to Sui blockchain...${NC}"
echo -e "${YELLOW}⚠️  This will require gas fees. Please approve the transaction in your wallet.${NC}"
echo ""

# Run publish command and capture output
DEPLOY_OUTPUT=$(sui client publish --gas-budget 100000000 --json)

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Contract deployment failed${NC}"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

echo -e "${GREEN}✅ Contract deployed successfully${NC}"
echo ""

# Parse the deployment output to extract PACKAGE_ID and REGISTRY_ID
echo -e "${BLUE}📝 Extracting contract addresses...${NC}"

# Extract PACKAGE_ID (the published package)
PACKAGE_ID=$(echo "$DEPLOY_OUTPUT" | jq -r '.objectChanges[] | select(.type == "published") | .packageId')

# Extract REGISTRY_ID (the shared Registry object)
REGISTRY_ID=$(echo "$DEPLOY_OUTPUT" | jq -r '.objectChanges[] | select(.objectType != null) | select(.objectType | contains("Registry")) | .objectId')

if [ -z "$PACKAGE_ID" ] || [ "$PACKAGE_ID" == "null" ]; then
    echo -e "${RED}❌ Failed to extract PACKAGE_ID${NC}"
    echo "Deployment output:"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

if [ -z "$REGISTRY_ID" ] || [ "$REGISTRY_ID" == "null" ]; then
    echo -e "${YELLOW}⚠️  Warning: Could not extract REGISTRY_ID${NC}"
    echo -e "${YELLOW}   You may need to manually update REGISTRY_ID in web/lib/contracts.ts${NC}"
    REGISTRY_ID="0x0"
fi

echo -e "${GREEN}✅ PACKAGE_ID: ${PACKAGE_ID}${NC}"
echo -e "${GREEN}✅ REGISTRY_ID: ${REGISTRY_ID}${NC}"
echo ""

# Update the frontend configuration
cd ..
CONFIG_FILE="web/lib/contracts.ts"

echo -e "${BLUE}🔧 Updating frontend configuration...${NC}"

# Backup the original file
cp "$CONFIG_FILE" "${CONFIG_FILE}.backup"

# Update the file
cat > "$CONFIG_FILE" << EOF
// Auto-generated by deploy.sh - Last updated: $(date)
export const PACKAGE_ID = "${PACKAGE_ID}";
export const REGISTRY_ID = "${REGISTRY_ID}";
export const MODULE_NAME = "model_hub";
EOF

echo -e "${GREEN}✅ Configuration updated in ${CONFIG_FILE}${NC}"
echo -e "${BLUE}📄 Backup saved as ${CONFIG_FILE}.backup${NC}"

# Restart frontend if requested
if [ "$RESTART_FRONTEND" = true ]; then
    restart_frontend
fi

# Display summary
echo ""
echo "================================================"
echo -e "${GREEN}✨ Deployment Complete!${NC}"
echo "================================================"
echo ""
echo "Contract Addresses:"
echo "  PACKAGE_ID:  ${PACKAGE_ID}"
echo "  REGISTRY_ID: ${REGISTRY_ID}"
echo ""
echo "Configuration file updated: ${CONFIG_FILE}"

if [ "$RESTART_FRONTEND" = true ]; then
    echo ""
    echo -e "${GREEN}🎉 Frontend server restarted and ready!${NC}"
    echo -e "${BLUE}🌐 Open http://localhost:3000 to test download tracking${NC}"
else
    echo ""
    echo -e "${YELLOW}📌 Next Steps:${NC}"
    echo "  1. Restart your Next.js development server:"
    echo "     cd web && npm run dev"
    echo "  2. Test the download tracking feature"
    echo "  3. Verify download counts update correctly"
fi

echo ""
echo -e "${BLUE}💡 Tip: The old contract addresses are backed up in ${CONFIG_FILE}.backup${NC}"
echo ""


#!/bin/bash

# Walrus Sites Deployment Script
# This script builds the Next.js app as static files and deploys to Walrus Sites

set -e  # Exit on error

echo "🚀 Starting Walrus Sites deployment..."

# Step 1: Build the Next.js app
echo ""
echo "📦 Step 1: Building Next.js static export..."
cd web
npm run build

# Check if build was successful
if [ ! -d "out" ]; then
    echo "❌ Error: Build failed - 'out' directory not found"
    exit 1
fi

echo "✅ Build completed successfully!"

# Step 2: Deploy to Walrus Sites using site-builder-testnet
echo ""
echo "🌐 Step 2: Deploying to Walrus Sites (Testnet)..."
echo ""

# Check if site-builder-testnet is installed
if ! command -v site-builder-testnet &> /dev/null; then
    echo "❌ Error: site-builder-testnet is not installed"
    echo ""
    echo "Please install it with:"
    echo "  cargo install --git https://github.com/MystenLabs/walrus-sites site-builder"
    echo ""
    exit 1
fi

echo "📝 Note: This will require SUI tokens for gas fees"
echo "   Make sure your wallet has sufficient balance"
echo ""
echo "🚀 Starting deployment..."
echo ""

# Deploy to Walrus Sites testnet with 100 epochs (about 1 year on testnet)
echo "📅 Setting storage duration to 100 epochs..."
echo "📝 Site name: Walrus Model Hub"
echo ""
echo "⚠️  Note: If this fails with 'could not find a valid Walrus configuration file',"
echo "   please run: walrus info"
echo "   This will help initialize your Walrus configuration."
echo ""
site-builder-testnet publish --epochs 100 --site-name "walrus-model-hub" out/

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment completed successfully!"
    echo ""
    echo "🎉 Your site is now live on Walrus Sites (Testnet)!"
    echo ""
    echo "📌 Next steps:"
    echo "   1. Test all functionality on the deployed site"
    echo "   2. Configure your LLM API Key in the app settings"
    echo "   3. Connect your Sui wallet to test uploads/downloads"
    echo ""
else
    echo ""
    echo "❌ Deployment failed"
    echo "   Please check the error messages above"
    echo ""
    exit 1
fi

cd ..
echo ""
echo "✨ Build process completed! Static files are in web/out/"

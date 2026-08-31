#!/bin/bash

# HDS Kitchen Visualizer - Vercel Deployment Script
# Run this script to deploy to Vercel

set -e

echo "🚀 HDS Kitchen Visualizer - Vercel Deployment"
echo "=============================================="

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "☁️  Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your kitchen visualizer is now live!"
echo "Share the URL with your customers via WhatsApp or embed it on your website."

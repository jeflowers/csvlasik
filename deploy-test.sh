#!/bin/bash

# Quick Netlify Deploy Script for YouTube Embed Testing
# This script helps you deploy to Netlify to test YouTube embeds

echo "=========================================="
echo "🚀 Netlify Deploy Helper"
echo "=========================================="
echo ""

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found"
    echo ""
    echo "Install it with:"
    echo "  npm install -g netlify-cli"
    echo ""
    exit 1
fi

echo "✅ Netlify CLI found"
echo ""

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "⚠️  dist folder not found. Building project..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed"
        exit 1
    fi
    echo "✅ Build complete"
else
    echo "✅ dist folder found"
fi

echo ""
echo "=========================================="
echo "Deploying to Netlify..."
echo "=========================================="
echo ""

# Deploy to Netlify (draft mode)
netlify deploy --dir=dist

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo "1. Copy the 'Website Draft URL' from above"
echo "2. Add '/youtube-test.html' to the URL"
echo "3. Test YouTube embeds"
echo ""
echo "Example: https://abc123--yoursite.netlify.app/youtube-test.html"
echo ""
echo "If everything works, deploy to production with:"
echo "  netlify deploy --prod --dir=dist"
echo ""

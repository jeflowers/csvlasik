#!/bin/bash

echo "🧹 Cleaning up old dependencies..."

# Remove node_modules and lock files
rm -rf node_modules package-lock.json dist
cd server
rm -rf node_modules package-lock.json
cd ..

echo "🗑️  Clearing npm cache..."
npm cache clean --force

echo "📦 Installing frontend dependencies..."
npm install

echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

echo "🔍 Running security audit..."
npm audit --audit-level=moderate

echo "✅ Dependencies updated successfully!"
echo ""
echo "To start the development servers:"
echo "  npm run dev:full"
echo ""
echo "To check for further updates:"
echo "  npx npm-check-updates"
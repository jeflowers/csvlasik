#!/bin/bash

# Get current branch name dynamically
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "📁 Current branch: $CURRENT_BRANCH"
echo ""

# Show what's not tracked
echo "🔍 Untracked files:"
git status
echo ""

# Add all untracked files
echo "➕ Adding all files..."
git add .
echo ""

# Check what will be committed
echo "✅ Staged files:"
git status
echo ""

# Commit
echo "💾 Committing..."
git commit -m "fix: Add all missing project files

- Add complete src/ directory structure
- Add all components and pages
- Add configuration files
- Add test files
- Add documentation"
echo ""

# Push to current branch (not hardcoded to main)
echo "🚀 Pushing to origin/$CURRENT_BRANCH..."
git push origin "$CURRENT_BRANCH"
echo ""

echo "✅ Done! Check GitHub: https://github.com/jeflowers/csvlasik"
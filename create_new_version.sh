#!/bin/bash
# Quick script to create a new version branch

echo "🚀 Creating New Version Branch"
echo ""

# Get version number from user
read -p "Enter version number (e.g., 4.0): " VERSION

if [ -z "$VERSION" ]; then
    echo "❌ Version number required!"
    exit 1
fi

BRANCH_NAME="ver-$VERSION"

# Check if branch already exists
if git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
    echo "⚠️  Branch $BRANCH_NAME already exists!"
    read -p "Do you want to switch to it? (y/n): " SWITCH
    if [ "$SWITCH" = "y" ]; then
        git checkout $BRANCH_NAME
        echo "✅ Switched to $BRANCH_NAME"
    fi
    exit 0
fi

# Ensure we're on main and up to date
echo "📋 Checking out main branch..."
git checkout main
git pull origin main

# Create and switch to new branch
echo "🌿 Creating branch: $BRANCH_NAME"
git checkout -b $BRANCH_NAME

echo ""
echo "✅ Successfully created and switched to $BRANCH_NAME"
echo ""
echo "📝 Next steps:"
echo "   1. Make your changes"
echo "   2. Test thoroughly"
echo "   3. Update CHANGELOG.md"
echo "   4. Commit: git commit -m 'v$VERSION: Description'"
echo "   5. Push: git push origin $BRANCH_NAME"
echo ""

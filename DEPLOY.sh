#!/bin/bash
# Deploy script for hand-tracked coin toss

echo "🚀 Deploying Hand-Tracked Coin Toss to GitHub Pages"
echo "===================================================="
echo ""

# Check if on feature branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Option to merge to main
read -p "Do you want to merge to main branch first? (y/n): " MERGE_TO_MAIN

if [ "$MERGE_TO_MAIN" = "y" ] || [ "$MERGE_TO_MAIN" = "Y" ]; then
    echo ""
    echo "📦 Merging to main..."

    # Stash any uncommitted changes
    git stash

    # Switch to main
    git checkout main

    # Pull latest
    git pull origin main

    # Merge feature branch
    git merge "$CURRENT_BRANCH" -m "Merge hand-tracked coin toss with PBR textures"

    # Push to main
    git push origin main

    echo "✅ Merged to main and pushed!"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Go to: https://github.com/sliu44artcenter/ixp1final1/settings/pages"
    echo "   2. Select branch: main"
    echo "   3. Click Save"
    echo "   4. Wait 2-3 minutes"
    echo "   5. Visit: https://sliu44artcenter.github.io/ixp1final1/"
else
    echo ""
    echo "📝 Deploying from current branch..."
    echo ""
    echo "Steps:"
    echo "   1. Go to: https://github.com/sliu44artcenter/ixp1final1/settings/pages"
    echo "   2. Select branch: $CURRENT_BRANCH"
    echo "   3. Click Save"
    echo "   4. Wait 2-3 minutes"
    echo "   5. Visit: https://sliu44artcenter.github.io/ixp1final1/"
fi

echo ""
echo "===================================================="
echo "🌐 Your site will be live at:"
echo "   https://sliu44artcenter.github.io/ixp1final1/"
echo "===================================================="

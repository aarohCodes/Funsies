#!/bin/bash

# Script to push Network Optimizer to GitHub

echo "========================================="
echo "Network Optimizer - GitHub Setup"
echo "========================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed. Please install git first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "Error: Please run this script from the network-optimizer directory"
    exit 1
fi

echo "Step 1: Initializing git repository..."
if [ -d ".git" ]; then
    echo "Git repository already initialized."
else
    git init
    echo "✓ Git repository initialized"
fi

echo ""
echo "Step 2: Adding files to git..."
git add .

echo ""
echo "Step 3: Checking status..."
git status

echo ""
echo "Step 4: Creating initial commit..."
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Initial commit: Network Optimizer application with ML models and React dashboard"
fi

git commit -m "$commit_msg"

echo ""
echo "========================================="
echo "Next Steps:"
echo "========================================="
echo ""
echo "1. Create a repository on GitHub:"
echo "   - Go to https://github.com/new"
echo "   - Name it: network-optimizer"
echo "   - DON'T initialize with README"
echo ""
echo "2. Add the remote and push:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/network-optimizer.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "Replace YOUR_USERNAME with your GitHub username!"
echo ""
echo "Or run these commands manually:"
echo "----------------------------------------"
echo "git remote add origin https://github.com/YOUR_USERNAME/network-optimizer.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""


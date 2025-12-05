#!/bin/bash

# Quick script to check Node.js installation and provide setup instructions

echo "🔍 Checking for Node.js installation..."
echo ""

# Check for node
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js is installed: $NODE_VERSION"
else
    echo "❌ Node.js is NOT installed"
    echo ""
    echo "📥 To install Node.js, choose one of these methods:"
    echo ""
    echo "1. Official Installer (Easiest):"
    echo "   Visit: https://nodejs.org/"
    echo "   Download the LTS version and install"
    echo ""
    echo "2. Homebrew:"
    echo "   brew install node"
    echo ""
    echo "3. NVM:"
    echo "   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "   Then: nvm install 20"
    echo ""
    echo "See SETUP_NODE.md for detailed instructions"
    exit 1
fi

# Check for npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm is installed: $NPM_VERSION"
else
    echo "❌ npm is NOT installed (this is unusual if Node.js is installed)"
    exit 1
fi

echo ""
echo "📦 Checking project dependencies..."

if [ -d "node_modules" ]; then
    echo "✅ Dependencies are installed"
else
    echo "⚠️  Dependencies are NOT installed"
    echo ""
    echo "Run: npm install"
fi

echo ""
echo "🚀 Ready to start development!"
echo "Run: npm run deb"


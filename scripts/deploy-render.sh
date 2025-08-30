#!/bin/bash

# Render Deployment Script for AI Mentions App
# This script helps prepare and deploy the application to Render

echo "🚀 Preparing AI Mentions App for Render deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found. You'll need to set environment variables on Render."
    echo "   Please create .env.local with your configuration or set variables in Render dashboard."
fi

# Build the application
echo "📦 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Check for required files
echo "🔍 Checking for required files..."

required_files=("render.yaml" "package.json" "next.config.js")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file found"
    else
        echo "❌ $file not found - this may cause deployment issues"
    fi
done

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Prisma client generation failed. This may cause issues if you're using the database."
fi

echo ""
echo "🎯 Deployment Preparation Complete!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for Render deployment'"
echo "   git push origin main"
echo ""
echo "2. Connect your GitHub repository to Render:"
echo "   - Go to https://render.com"
echo "   - Create a new Web Service"
echo "   - Connect your GitHub repository"
echo "   - Render will automatically detect the render.yaml configuration"
echo ""
echo "3. Set environment variables in Render dashboard:"
echo "   - DATABASE_URL (from Render PostgreSQL)"
echo "   - NEXTAUTH_SECRET (generate a secure random string)"
echo "   - NEXTAUTH_URL (your Render app URL)"
echo "   - OPENAI_API_KEY (your OpenAI API key)"
echo "   - OAuth credentials (Google, GitHub)"
echo ""
echo "4. Deploy and monitor the build process"
echo ""
echo "📚 For more details, see DATABASE_SETUP.md and production.env.example"

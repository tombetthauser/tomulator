#!/bin/bash

echo "🚀 Starting Tomulator Development Environment..."

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first:"
    echo "   curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun is installed"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your database connection string"
    echo "   Then run this script again"
    exit 1
fi

echo "✅ Environment file found"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    bun install
fi

# Build the application first
echo "🔨 Building the application..."
bun run build

echo ""
echo "🎯 Starting development servers..."
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3000/api"
echo ""
echo "📝 The application will automatically:"
echo "   • Rebuild frontend when you change React components"
echo "   • Restart backend when you change server code"
echo "   • Hot reload frontend changes in the browser"
echo ""
echo "🛑 Press Ctrl+C to stop all servers"
echo ""

# Start both frontend and backend in development mode
bun run dev:full

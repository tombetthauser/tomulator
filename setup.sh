#!/bin/bash

echo "🚀 Setting up Generic CRUD Application..."

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first:"
    echo "   curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun is installed"

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your database connection string"
else
    echo "✅ .env file already exists"
fi

# Build the application
echo "🔨 Building the application..."
bun run build

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database connection string"
echo "2. Run the database schema: src/database/schema.sql"
echo "3. Start the server: bun run start"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "For development mode: bun run dev"

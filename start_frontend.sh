#!/bin/bash

# PodcastAI Frontend Startup Script

echo "🚀 Starting PodcastAI Frontend Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Check if .env file exists
if [ ! -f "frontend/.env" ]; then
    echo "⚠️  .env file not found. Creating default configuration..."
    echo "VITE_API_URL=http://localhost:8000/api/v1" > frontend/.env
    echo "Please update the .env file if needed."
fi

# Start the development server
echo "🌟 Starting Vite development server..."
echo "Frontend will be available at: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd frontend
npm run dev

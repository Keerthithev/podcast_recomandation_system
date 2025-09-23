#!/bin/bash

# PodcastAI Backend Startup Script

echo "🚀 Starting PodcastAI Backend Server..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source backend/venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
cd backend
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from config.py..."
    echo "Please update the .env file with your actual API keys and database credentials."
fi

# Start the server
echo "🌟 Starting FastAPI server..."
echo "Backend will be available at: http://localhost:8000"
echo "API documentation at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python main.py

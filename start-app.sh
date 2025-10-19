#!/bin/bash

# Network Navigator - Local Server Launcher
echo "🌐 Starting Network Navigator..."
echo "📁 Server running from: $(pwd)"
echo "🔗 Open your browser and go to: http://localhost:8000"
echo "⏹️  Press Ctrl+C to stop the server"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m http.server 8000
else
    echo "❌ Python not found. Please install Python to run the local server."
    echo "   You can also just open index.html directly in your browser."
    exit 1
fi

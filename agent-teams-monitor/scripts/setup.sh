#!/bin/bash

# Agent Teams Monitor - Setup Script
# Installs dependencies for both backend and frontend

set -e

PROJECT_DIR="$1"

if [ -z "$PROJECT_DIR" ]; then
  echo "Usage: ./setup.sh <project-directory>"
  exit 1
fi

cd "$PROJECT_DIR"

echo "🚀 Installing Agent Teams Monitor dependencies..."
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Installation complete!"
echo ""
echo "To start the development server:"
echo "  cd $PROJECT_DIR"
echo "  npm run dev"
echo ""
echo "To start in production mode:"
echo "  npm run preview"

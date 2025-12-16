#!/bin/bash

# Railway Deployment Script for Healthy Care Mobile Backend

echo "🚀 Starting deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Seed database (optional - comment out if not needed)
# echo "🌱 Seeding database..."
# npm run prisma:seed

# Start the server
echo "✅ Starting server..."
npm start

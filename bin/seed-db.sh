#!/bin/bash

# Seed Database Script
# Populates database with test data

echo "🌱 Seeding database..."
export DATABASE_URL="postgresql://postgres:lssgoo.com@db.stfenwtkxxvtwucjqire.supabase.co:5432/postgres"
pnpm db:seed
echo "✅ Database seeded successfully!"


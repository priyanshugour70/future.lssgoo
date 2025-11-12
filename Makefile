.PHONY: help install dev build setup seed test oauth clean

# Default target
help:
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "🚀 Future Platform - Available Commands"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "  make install    - Install all dependencies"
	@echo "  make setup      - Complete setup (DB + seed data)"
	@echo "  make dev        - Start development server"
	@echo "  make seed       - Populate database with test data"
	@echo "  make oauth      - Show Google OAuth setup instructions"
	@echo "  make test       - Test your setup"
	@echo "  make clean      - Clean build files and cache"
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	@pnpm install
	@echo "✅ Dependencies installed!"

# Complete setup
setup:
	@echo "🔧 Setting up Future platform..."
	@export DATABASE_URL="postgresql://postgres:lssgoo.com@db.stfenwtkxxvtwucjqire.supabase.co:5432/postgres" && \
	pnpm prisma generate && \
	pnpm prisma db push
	@chmod +x bin/*.sh
	@echo ""
	@echo "✅ Setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Run: make oauth (to configure Google OAuth)"
	@echo "  2. Run: make seed (to add test data)"
	@echo "  3. Run: make dev (to start development)"
	@echo ""

# Start development server
dev:
	@echo "🚀 Starting development server..."
	@pnpm dev

# Seed database
seed:
	@echo "🌱 Seeding database with test data..."
	@chmod +x bin/seed-db.sh
	@./bin/seed-db.sh

# Show OAuth setup instructions
oauth:
	@chmod +x bin/setup-oauth.sh
	@./bin/setup-oauth.sh

# Test setup
test:
	@echo "🧪 Testing setup..."
	@chmod +x bin/test-setup.sh
	@./bin/test-setup.sh

# Clean build files
clean:
	@echo "🧹 Cleaning build files..."
	@rm -rf .next
	@rm -rf node_modules/.cache
	@rm -rf .turbo
	@echo "✅ Clean complete!"


#!/bin/bash

# Test Setup Script - Future Platform
# This script verifies your setup is correct

echo "🔍 Testing Future Platform Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js version... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    exit 1
fi

# Check pnpm
echo -n "Checking pnpm... "
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    echo -e "${GREEN}✓${NC} v$PNPM_VERSION"
else
    echo -e "${RED}✗${NC} pnpm not found. Install with: npm install -g pnpm"
    exit 1
fi

# Check .env.local
echo -n "Checking .env.local... "
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} Found"
    
    # Check required variables
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo -e "  ${GREEN}✓${NC} NEXT_PUBLIC_SUPABASE_URL"
    else
        echo -e "  ${RED}✗${NC} NEXT_PUBLIC_SUPABASE_URL missing"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo -e "  ${GREEN}✓${NC} NEXT_PUBLIC_SUPABASE_ANON_KEY"
    else
        echo -e "  ${RED}✗${NC} NEXT_PUBLIC_SUPABASE_ANON_KEY missing"
    fi
    
    if grep -q "DATABASE_URL" .env.local; then
        echo -e "  ${GREEN}✓${NC} DATABASE_URL"
    else
        echo -e "  ${RED}✗${NC} DATABASE_URL missing"
    fi
else
    echo -e "${RED}✗${NC} Not found"
    echo ""
    echo "Create .env.local with:"
    echo "  cp .env.example .env.local"
    echo "  # Then edit with your values"
    exit 1
fi

# Check node_modules
echo -n "Checking dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗${NC} Not installed"
    echo "Run: pnpm install"
    exit 1
fi

# Check Prisma client
echo -n "Checking Prisma client... "
if [ -d "node_modules/.prisma/client" ]; then
    echo -e "${GREEN}✓${NC} Generated"
else
    echo -e "${YELLOW}⚠${NC} Not generated"
    echo "Run: pnpm prisma generate"
fi

# Check database connection
echo -n "Testing database connection... "
export DATABASE_URL="postgresql://postgres:lssgoo.com@db.stfenwtkxxvtwucjqire.supabase.co:5432/postgres"
if pnpm prisma db execute --stdin <<< "SELECT 1;" &> /dev/null; then
    echo -e "${GREEN}✓${NC} Connected"
else
    echo -e "${RED}✗${NC} Connection failed"
    echo "Check your DATABASE_URL"
fi

# Check if tables exist
echo -n "Checking database tables... "
TABLE_COUNT=$(pnpm prisma db execute --stdin <<< "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'sessions', 'audit_logs');" 2>/dev/null | tail -1)
if [ "$TABLE_COUNT" = "3" ]; then
    echo -e "${GREEN}✓${NC} All tables exist (users, sessions, audit_logs)"
else
    echo -e "${YELLOW}⚠${NC} Tables may be missing"
    echo "Run: pnpm prisma db push"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ Setup verification complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start dev server: ${YELLOW}pnpm dev${NC}"
echo "  2. Visit: ${YELLOW}http://localhost:3000${NC}"
echo "  3. Configure Google OAuth in Supabase"
echo "  4. Test authentication"
echo ""
echo "For detailed instructions, see QUICK_START.md"
echo ""


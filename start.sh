#!/bin/bash
# Takafol - Start Script
# Usage: ./start.sh

set -e

echo "========================================="
echo "  Takafol - Community Impact Platform"
echo "========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js v18+ first."
    exit 1
fi

echo "Node.js: $(node -v)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
    else
        cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://admin1:admin1@localhost:5432/takafol"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Blockchain (Sepolia testnet)
SEPOLIA_RPC_URL=
SERVER_WALLET_PRIVATE_KEY=
CONTRACT_ADDRESS=
EOF
    fi
    echo "Please update .env with your credentials."
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Check if database is accessible
echo "Checking database connection..."
if npx prisma db push --accept-data-loss 2>/dev/null; then
    echo "Database schema synced."
else
    echo "WARNING: Could not connect to database. Make sure PostgreSQL is running."
    echo "  Expected: postgresql://admin1:admin1@localhost:5432/takafol"
    echo ""
    echo "  To create the database:"
    echo "    sudo -u postgres createdb takafol"
    echo "    sudo -u postgres psql -c \"CREATE USER admin1 WITH PASSWORD 'admin1';\""
    echo "    sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE takafol TO admin1;\""
    echo ""
fi

# Seed database
echo "Seeding database..."
npx tsx prisma/seed.ts 2>/dev/null || echo "Seed skipped (may already be seeded)"

echo ""
echo "========================================="
echo "  Starting Takafol dev server..."
echo "  http://localhost:3000"
echo "========================================="
echo ""

# Start dev server
npm run dev

#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "========================================="
echo "  Takafol by Nexara - Local Dev Setup"
echo "========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "Node.js is not installed. Please install Node.js 18+."
  exit 1
fi
echo "Node.js: $(node -v)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo ""
  echo "Installing dependencies..."
  npm install
fi

# Check for .env
if [ ! -f ".env" ]; then
  echo ""
  echo "Creating .env with local defaults..."
  cat > .env <<'ENVEOF'
DATABASE_URL="postgresql://user:password@localhost:5432/takafol?schema=public"
SEPOLIA_RPC_URL="https://rpc.sepolia.org"
SERVER_WALLET_PRIVATE_KEY=""
CONTRACT_ADDRESS=""
ENVEOF
  echo ".env created - update DATABASE_URL with your Railway connection string"
fi

# Generate Prisma client
echo ""
echo "Generating Prisma client..."
npx prisma generate

# Check if DATABASE_URL is still placeholder
DB_URL=$(grep DATABASE_URL .env | cut -d'"' -f2)
if [[ "$DB_URL" == *"user:password@host"* ]] || [[ "$DB_URL" == *"user:password@localhost"* ]]; then
  echo ""
  echo "WARNING: DATABASE_URL is still a placeholder!"
  echo "The app will start but API routes will fail until you set a real database."
  echo ""
  echo "To fix: update DATABASE_URL in .env with your Railway PostgreSQL connection string"
  echo "Then run: npx prisma db push && npm run db:seed"
  echo ""
fi

# Start dev server
echo "Starting Next.js dev server..."
echo "Open http://localhost:3000 in your browser"
echo ""
npm run dev

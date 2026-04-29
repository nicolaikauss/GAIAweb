#!/bin/bash

# Verification Script
# Runs all checks to ensure the app is ready for deployment

set -e

echo "🚀 Starting verification process..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

# Function to run check
run_check() {
  local name=$1
  local command=$2
  
  echo -e "${YELLOW}▶ Running: $name${NC}"
  if eval "$command"; then
    echo -e "${GREEN}✅ $name passed${NC}"
    echo ""
  else
    echo -e "${RED}❌ $name failed${NC}"
    echo ""
    ((FAILURES++))
  fi
}

# Check if dependencies are installed
run_check "Dependency check" "npm list --depth=0 > /dev/null 2>&1 || npm install"

# Run TypeScript type checking
run_check "TypeScript type check" "npm run typecheck"

# Run linting
run_check "ESLint check" "npm run lint -- --max-warnings=50"

# Build the project
run_check "Build check" "npm run build"

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $FAILURES -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! Ready for deployment.${NC}"
  exit 0
else
  echo -e "${RED}❌ $FAILURES check(s) failed. Please fix before deploying.${NC}"
  exit 1
fi

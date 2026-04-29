#!/bin/bash

# Design System Audit Script
# Finds hardcoded color violations across the codebase

echo "🎨 Design System Audit"
echo "====================="
echo ""

# Colors to check
PATTERNS=(
  "text-white"
  "text-black"
  "bg-white"
  "bg-black"
  "bg-gray"
  "text-gray"
  "border-gray"
  "bg-blue"
  "text-blue"
  "border-blue"
  "bg-slate"
  "text-slate"
  "border-slate"
)

TOTAL_VIOLATIONS=0

for pattern in "${PATTERNS[@]}"; do
  echo "Checking for: $pattern"
  
  # Count matches
  count=$(grep -r "$pattern" src/pages src/components --include="*.tsx" --include="*.ts" | wc -l)
  
  if [ "$count" -gt 0 ]; then
    echo "  ❌ Found $count violations"
    TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + count))
    
    # Show files with violations
    grep -r "$pattern" src/pages src/components --include="*.tsx" --include="*.ts" -l | sed 's/^/     /'
  else
    echo "  ✅ No violations"
  fi
  
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$TOTAL_VIOLATIONS" -eq 0 ]; then
  echo "✅ No violations found! Design system is enforced."
  exit 0
else
  echo "❌ Total violations: $TOTAL_VIOLATIONS"
  echo ""
  echo "Next steps:"
  echo "1. Replace hardcoded colors with semantic tokens from index.css"
  echo "2. Use: text-foreground, text-muted-foreground, bg-background, bg-card, etc."
  echo "3. For glass morphism, use Dashboard patterns:"
  echo "   - border-white/20 bg-white/10 backdrop-blur-md"
  echo ""
  exit 1
fi

#!/bin/bash
set -euo pipefail
echo "=== verify-no-forbidden-artifacts ==="

FAIL=0

# Check for deprecated or forbidden artifact patterns
if [[ -f "docs/implementation-checklist.md" ]]; then
  echo "[X] FAIL: Found deprecated implementation-checklist.md (replaced by gate system)"
  FAIL=1
fi

if [[ -f "docs/build-plan.md" ]]; then
  echo "[X] FAIL: Found deprecated build-plan.md (replaced by gate system)"
  FAIL=1
fi

# Check for individual gate script files in docs/ (should be in scripts/)
GATE_COUNT=$(find docs -maxdepth 1 -name "verify-*.sh" 2>/dev/null | wc -l)
if [[ $GATE_COUNT -gt 0 ]]; then
  echo "[X] FAIL: Found $GATE_COUNT gate scripts in docs/ (should be in scripts/)"
  find docs -maxdepth 1 -name "verify-*.sh"
  FAIL=1
fi

if [[ $FAIL -eq 0 ]]; then
  echo "[OK] No forbidden artifacts found"
fi

exit $FAIL

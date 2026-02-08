#!/bin/bash
set -euo pipefail
echo "=== verify-spec-size-budget ==="

DOCS_DIR="docs"
FAIL=0

# Check specification artifact sizes (200KB budget per file)
MAX_SIZE_KB=200
MAX_SIZE_BYTES=$((MAX_SIZE_KB * 1024))

for file in "$DOCS_DIR"/*.json; do
  if [[ -f "$file" ]]; then
    SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    if [[ $SIZE -gt $MAX_SIZE_BYTES ]]; then
      SIZE_KB=$((SIZE / 1024))
      echo "[X] FAIL: $file is ${SIZE_KB}KB (exceeds ${MAX_SIZE_KB}KB budget)"
      FAIL=1
    else
      SIZE_KB=$((SIZE / 1024))
      echo "[OK] $file: ${SIZE_KB}KB"
    fi
  fi
done

if [[ $FAIL -eq 0 ]]; then
  echo "[OK] All specification files within size budget"
fi

exit $FAIL

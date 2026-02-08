#!/bin/bash
set -euo pipefail
echo "=== verify-no-placeholders ==="

PROJECT_ROOT="."
FAIL=0

# Define placeholder patterns (universal dev conventions)
PLACEHOLDER_PATTERNS=("TODO" "FIXME" "PLACEHOLDER" "XXX" "HACK")

# Search all code files for placeholders
SEARCH_DIRS=()

# Derive source directories from artifacts
for artifact in docs/service-contracts.json docs/data-relationships.json docs/ui-api-deps.json; do
  if [[ -f "$artifact" ]]; then
    while IFS= read -r dir; do
      if [[ -n "$dir" && -d "$dir" ]]; then
        SEARCH_DIRS+=("$dir")
      fi
    done < <(grep -oP '"[^"]*\.(ts|tsx|js|jsx)"' "$artifact" | tr -d '"' | sed 's|/[^/]*$||' | sort -u)
  fi
done

# Deduplicate directories
SEARCH_DIRS=($(printf '%s\n' "${SEARCH_DIRS[@]}" | sort -u))

if [[ ${#SEARCH_DIRS[@]} -eq 0 ]]; then
  echo "[SKIP] No source directories found in artifacts"
  exit 0
fi

for pattern in "${PLACEHOLDER_PATTERNS[@]}"; do
  for dir in "${SEARCH_DIRS[@]}"; do
    if [[ -d "$dir" ]]; then
      MATCHES=$(grep -r "$pattern" "$dir" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null || echo "")
      if [[ -n "$MATCHES" ]]; then
        echo "[X] FAIL: Found $pattern in $dir"
        echo "$MATCHES" | head -5 | sed 's/^/    /'
        FAIL=1
      fi
    fi
  done
done

if [[ $FAIL -eq 0 ]]; then
  echo "[OK] No placeholder patterns found in source code"
fi

exit $FAIL

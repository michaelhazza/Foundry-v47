#!/bin/bash
set -euo pipefail
echo "=== verify-config-files-required ==="

FAIL=0

# Check for required configuration files
REQUIRED_CONFIGS=(
  ".env.example"
  "package.json"
)

for file in "${REQUIRED_CONFIGS[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "[X] FAIL: Missing required config file: $file"
    FAIL=1
  else
    echo "[OK] $file exists"
  fi
done

# Verify .env.example contains variables from env-manifest.json
if [[ -f "docs/env-manifest.json" ]] && [[ -f ".env.example" ]]; then
  ENV_COUNT=$(grep -c '"name"' "docs/env-manifest.json" || echo "0")
  
  if [[ $ENV_COUNT -gt 0 ]]; then
    echo "Verifying .env.example contains $ENV_COUNT variables..."
    
    for i in $(seq 0 $((ENV_COUNT - 1))); do
      ENV_VAR=$(grep -o '"name": "[^"]*"' "docs/env-manifest.json" | sed -n "$((i+1))p" | cut -d'"' -f4)
      
      if ! grep -q "^$ENV_VAR=" ".env.example"; then
        echo "[X] FAIL: $ENV_VAR not found in .env.example"
        FAIL=1
      else
        echo "[OK] $ENV_VAR in .env.example"
      fi
    done
  fi
fi

exit $FAIL

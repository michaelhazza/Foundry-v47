#!/bin/bash
set -euo pipefail
echo "=== verify-token-scoped-routing ==="

SCOPE_MANIFEST="docs/scope-manifest.json"
SERVICE_CONTRACTS="docs/service-contracts.json"
FAIL=0

if [[ ! -f "$SCOPE_MANIFEST" ]] || [[ ! -f "$SERVICE_CONTRACTS" ]]; then
  echo "[SKIP] Required artifacts not found"
  exit 0
fi

# Read isolation field from scope-manifest.json
ISOLATION_FIELD=$(grep -o '"isolationField": "[^"]*"' "$SCOPE_MANIFEST" | cut -d'"' -f4)

if [[ -z "$ISOLATION_FIELD" ]]; then
  echo "[SKIP] No tenant isolation configured"
  exit 0
fi

# Extract scope exceptions (paths that don't require tenant scoping)
SCOPE_EXCEPTIONS=$(grep -A 1 '"scopeExceptions"' "$SCOPE_MANIFEST" | grep '"path"' | cut -d'"' -f4)

echo "Checking $ISOLATION_FIELD scoping for org-scoped endpoints"
if [[ -n "$SCOPE_EXCEPTIONS" ]]; then
  echo "Scope exceptions:"
  echo "$SCOPE_EXCEPTIONS" | sed 's/^/  - /'
fi

# Check each authenticated endpoint
AUTH_ENDPOINTS=$(grep -B 2 '"mustUseAuth": true' "$SERVICE_CONTRACTS" | grep '"path"' | cut -d'"' -f4)

if [[ -z "$AUTH_ENDPOINTS" ]]; then
  echo "[OK] No authenticated endpoints"
  exit 0
fi

while IFS= read -r endpoint_path; do
  if [[ -z "$endpoint_path" ]]; then
    continue
  fi
  
  # Skip if path matches any exception pattern (glob-style matching)
  SKIP_ENDPOINT=false
  if [[ -n "$SCOPE_EXCEPTIONS" ]]; then
    while IFS= read -r exception_pattern; do
      # Glob-style matching for patterns like /api/auth/*
      if [[ "$endpoint_path" == $exception_pattern ]]; then
        SKIP_ENDPOINT=true
        echo "[SKIP] $endpoint_path (scope exception: $exception_pattern)"
        break
      fi
    done <<< "$SCOPE_EXCEPTIONS"
  fi
  
  if [[ "$SKIP_ENDPOINT" == "true" ]]; then
    continue
  fi
  
  # Verify routeArgs includes isolation field
  HAS_ISOLATION=$(grep -A 20 '"path": "'$endpoint_path'"' "$SERVICE_CONTRACTS" | grep '"routeArgs"' | grep -c "$ISOLATION_FIELD" || echo "0")
  
  if [[ $HAS_ISOLATION -eq 0 ]]; then
    echo "[X] $endpoint_path: Missing $ISOLATION_FIELD in routeArgs"
    FAIL=1
  else
    echo "[OK] $endpoint_path: $ISOLATION_FIELD scoping present"
  fi
done <<< "$AUTH_ENDPOINTS"

exit $FAIL

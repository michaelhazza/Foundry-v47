#!/bin/bash
set -euo pipefail
echo "=== verify-upload-config-sourced ==="

SERVICE_CONTRACTS="docs/service-contracts.json"
SCOPE_MANIFEST="docs/scope-manifest.json"
FAIL=0

if [[ ! -f "$SERVICE_CONTRACTS" ]] || [[ ! -f "$SCOPE_MANIFEST" ]]; then
  echo "[SKIP] Required artifacts not found"
  exit 0
fi

# Find upload endpoints
UPLOAD_COUNT=$(grep -c '"contentType": "multipart/form-data"' "$SERVICE_CONTRACTS" || echo "0")

if [[ $UPLOAD_COUNT -eq 0 ]]; then
  echo "[OK] No upload endpoints defined"
  exit 0
fi

# Verify platformConstraints.limits.maxFileUploadSize exists in scope-manifest
HAS_UPLOAD_LIMIT=$(grep -c '"maxFileUploadSize"' "$SCOPE_MANIFEST" || echo "0")

if [[ $HAS_UPLOAD_LIMIT -eq 0 ]]; then
  echo "[X] FAIL: scope-manifest.json missing maxFileUploadSize in platformConstraints.limits"
  FAIL=1
else
  UPLOAD_LIMIT=$(grep -A 1 '"maxFileUploadSize"' "$SCOPE_MANIFEST" | grep '"value"' | grep -o '[0-9]*')
  echo "[OK] Upload size limit defined: $UPLOAD_LIMIT bytes"
fi

exit $FAIL

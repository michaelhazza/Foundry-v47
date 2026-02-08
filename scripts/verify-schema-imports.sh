#!/bin/bash
set -euo pipefail
echo "=== verify-schema-imports ==="

# Derive schema directory from data-relationships.json
DATA_REL="docs/data-relationships.json"

if [[ ! -f "$DATA_REL" ]]; then
  echo "[SKIP] data-relationships.json not found"
  exit 0
fi

# Extract schema directory from table entries
SCHEMA_FILE=$(grep -o '"schemaFile": "[^"]*"' "$DATA_REL" | head -1 | cut -d'"' -f4)

if [[ -z "$SCHEMA_FILE" ]]; then
  echo "[SKIP] No schema files defined in data-relationships.json"
  exit 0
fi

SCHEMA_DIR=$(dirname "$SCHEMA_FILE")

if [[ ! -d "$SCHEMA_DIR" ]]; then
  echo "[SKIP] Schema directory not found: $SCHEMA_DIR"
  exit 0
fi

FAIL=0

echo "Checking schema imports in $SCHEMA_DIR..."

# Check for .js extensions in relative imports (breaks drizzle-kit CJS resolution)
while IFS= read -r file; do
  if grep -Pn "from\s+['\"]\..*\.js['\"]" "$file" > /dev/null 2>&1; then
    echo "[X] FAIL: $file contains .js extension in relative import"
    grep -Pn "from\s+['\"]\..*\.js['\"]" "$file" | sed 's/^/    /'
    FAIL=1
  fi
done < <(find "$SCHEMA_DIR" -name "*.ts" -type f)

if [[ $FAIL -eq 0 ]]; then
  echo "[OK] No .js extensions found in schema imports"
fi

exit $FAIL

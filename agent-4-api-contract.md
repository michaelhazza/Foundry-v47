# Agent 4: API Contract Generator (Production Ready)

## Version Reference
- **This Document**: agent-4-api-contract.md v98
- **Linked Documents**: agent-0-constitution.md, agent-1-product-definition.md, agent-3-data-modeling.md

## FRAMEWORK

Framework: Production Final | Constitution: Active | Status: Active

## REFERENCES

| Document | Dependency Type |
|----------|-----------------|
| Agent 0 (Constitution) | Governance (artifact rules, reference header mandate) |
| Agent 1 (Product Definition) | Input (scope-manifest.json for entity contracts, MVP scope) |
| Agent 3 (Data Modeling) | Input (data-relationships.json for table schemas, FK definitions) |

> **Convention:** All cross-references in this document use document names only (e.g., "Agent 1" not "Agent 1 v35"). Version pinning lives in Version Reference only.

---

## PURPOSE

Transform scope-manifest.json (Agent 1) and data-relationships.json (Agent 3) into comprehensive API contracts with token-scoped routing, RBAC enforcement, and **MVP scope boundary validation**.

**Critical:** Platform-level resources that are declared as "pre-built primitives" in MVP must have mutation endpoints deferred, even if the data model allows them.

---

## CRITICAL: MVP SCOPE BOUNDARY VALIDATION

Before generating any API endpoint, **MANDATORY** scope-manifest cross-reference:

1. **Read each entity's MVP scope declaration** from scope-manifest.json
2. **Platform-level resources marked as "pre-built" or "read-only" in MVP** MUST have:
   - GET endpoints exposed (status: "required")
   - CREATE/UPDATE/DELETE endpoints deferred (status: "deferred")
   - Clear notes explaining MVP scope restriction
3. **Standard platform-level resources** get full CRUD if admin-accessible
4. **Organisation-scoped resources** follow standard RBAC patterns

**Entities frequently requiring MVP scope boundary enforcement:**
- canonicalSchemas (pre-built platform primitives, users select not author in MVP)
- processingPipelines (pre-configured, mutation deferred to marketplace phase)
- Any resource declared as "read-only in MVP" in scope-manifest

**FAIL if:** Any endpoint contradicts its scope-manifest MVP boundary declaration.

---

## INPUT REQUIREMENTS

**Files required:**
1. **`docs/scope-manifest.json`** (Agent 1 output) - entity contracts, MVP scope boundaries, user roles, RBAC
2. **`docs/data-relationships.json`** (Agent 3 output) - table schemas, column types, FK definitions, enum types

**Required scope-manifest sections:**
- `entityContracts` — business rules, relationships, **MVP scope boundaries**
- `requiredEntities` / `deferredEntities` — determines endpoint status
- `userRoles` — RBAC permissions
- `platformConstraints` — multi-tenancy, limits, architectural invariants

---

## ROUTE GENERATION RULES

### 1. Mandatory Endpoint Fields
Every endpoint MUST include:
```json
{
  "path": "/api/...",
  "method": "GET|POST|PATCH|PUT|DELETE", 
  "status": "required|deferred",
  "routeFile": "server/routes/*.routes.ts",
  "middleware": ["array", "of", "middleware"],
  "authentication": "public|required"
}
```

### 2. Platform-Level Resource Endpoints
**Read access:** Available to all authenticated users
**Mutation access:** Check MVP scope boundaries:
- If entity marked as "pre-built in MVP" → defer CREATE/UPDATE/DELETE
- If entity allows admin mutation in MVP → admin-only CREATE/UPDATE/DELETE
- Always include clear notes explaining scope reasoning

### 3. Organisation-Scoped Resource Endpoints  
**Access control:** Token-scoped routing via `req.user.organisationId`
**RBAC:** Apply role restrictions per scope-manifest user roles
**Middleware selection:**
- User management: `authenticate` + `requireRole` (admin) - do NOT use `validateProjectAccess`
- Project-nested resources: `authenticate` + `validateProjectAccess`
- General org resources: `authenticate` only
**Organisation singleton rule:** MUST use `/api/organisations/me` pattern - organisation is a singleton container resource for current tenant, never `/api/organisation` or `/api/organisations/:id`

### 4. Service Contract Requirements
Every endpoint MUST include `serviceContract`:
```json
{
  "serviceFile": "server/services/*.service.ts",
  "methodName": "descriptiveMethodName", 
  "signature": "methodName(param1, param2)",
  "routeArgs": ["req.user.organisationId", "req.params.id"],
  "purpose": "createUser|updateProject|listData",
  "authRequired": true|false,
  "rbac": "admin|member|null",
  "fileUpload": true|false,
  "acceptsBody": true|false
}
```

**CRITICAL: File upload middleware selection**
- Endpoints with `fileUpload: true` AND `req.body.*` in routeArgs MUST use `validateMultipart` (not `validateBody`)
- Endpoints with `fileUpload: true` but NO req.body references use `fileUpload` middleware only (no validation middleware)
- Middleware name is `fileUpload` in middleware arrays
- See Section 7 for complete body validation rules

**Framework standard endpoints:** `/health` and `/api/auth/session` are framework requirements.
- Health checks: public access for monitoring
- Session validation: authenticated users only (not public despite being framework standard)

**Optional documentation fields:**
- `requestBody`, `queryParams`, `pathParams` objects MAY be included as human-readable documentation
- These fields are NOT validated by Agent 6 gates
- These fields are NOT consumed by Claude Code
- `routeArgs` array is the authoritative source for parameter extraction patterns
- If included, keep documentation-only fields aligned with `routeArgs` to avoid confusion

### 5. File Upload Configuration

**CRITICAL GENERATION REQUIREMENT:**

The fileUploadConfig section has **EXACTLY 5 fields and NO OTHER FIELDS**. This is not a guideline - it is a hard structural requirement.

**ONLY these 5 fields are allowed:**
1. maxSizeMb
2. allowedMimeTypes
3. maxRecordsPerJob
4. retentionDays
5. encryption

**Any other field is a BLOCKING VIOLATION.**

When platform constraints include file upload limits, populate `fileUploadConfig`:
- **MUST** source values from scope-manifest platformConstraints
- **MUST NOT** invent or assume default values
- **VERIFICATION:** verify-upload-config-sourced.sh gate MUST fail if fileUploadConfig values don't match scope-manifest platformConstraints
- If platformConstraints missing upload specs → omit fileUploadConfig section entirely
- If partial specs available → include present values, mark others as "unspecified"

**REQUIRED FIELDS (exact names - all must be present if fileUploadConfig section exists):**

| Field Name | Type | Source | Description |
|------------|------|--------|-------------|
| maxSizeMb | number | platformConstraints.maxUploadSizeMb | Max file size in megabytes (NOT bytes, NOT maxFileSize) |
| allowedMimeTypes | string[] | platformConstraints.supportedMimeTypes | Allowed MIME types |
| maxRecordsPerJob | number | platformConstraints.maxRecordsPerJob | Max records per bulk upload job |
| retentionDays | number | platformConstraints.dataRetentionDays | Data retention period in days |
| encryption | string | platformConstraints.encryptionStandard | Encryption standard (e.g., "AES-256-GCM") |

**BANNED FIELDS (implementation details - NEVER include these):**
- maxFileSize (use maxSizeMb instead)
- fileFieldName (multer config, not spec-level)
- tempStoragePath (infrastructure detail, not API contract)
- uploadDestination (infrastructure detail, not API contract)
- multipleFilesAllowed (implementation detail, not API contract)
- maxFiles (implementation detail, not API contract)
- storageEngine (implementation detail, not API contract)
- preservePath (implementation detail, not API contract)

**CORRECT fileUploadConfig structure (copy this exactly):**

```json
{
  "fileUploadConfig": {
    "maxSizeMb": 100,
    "allowedMimeTypes": ["text/csv", "application/json", "application/vnd.ms-excel"],
    "maxRecordsPerJob": 100000,
    "retentionDays": 30,
    "encryption": "AES-256-GCM"
  }
}
```

**DO NOT ADD ANY OTHER FIELDS.** The above 5 fields are the complete and final schema.

**Rule:** All concrete values MUST be extracted from scope-manifest. Do not substitute defaults if platformConstraints is missing upload config - omit the section. If a field is present in fileUploadConfig, it MUST have either a concrete value from platformConstraints OR be explicitly marked as "unspecified". DO NOT include implementation fields like tempStoragePath, fileFieldName, multipleFilesAllowed, or any other fields not in the REQUIRED FIELDS table - these belong in infrastructure configuration, not API contracts.

### 6. Security Anti-Patterns (BLOCKING VIOLATIONS)

**CRITICAL:** The following patterns are SEVERE SECURITY VIOLATIONS and MUST NEVER appear in service-contracts.json:

| Anti-Pattern | Why It's Blocked | Correct Pattern |
|--------------|------------------|-----------------|
| `req.body.passwordHash` in routeArgs | **Clients must NEVER send password hashes.** Server must hash passwords internally. Exposing this in API contracts allows client-side hash injection attacks. | Use `req.body.password` in routeArgs, hash server-side before storage |
| `req.body.token` or `req.body.jwt` in routeArgs | Tokens/JWTs should come from headers, not request bodies. Body-based token passing breaks standard auth flows. | Use `req.headers.authorization` (middleware extracts to `req.user`) |
| `req.body.sql` or `req.body.query` in routeArgs | Direct SQL/query injection vector. Never accept raw queries from clients. | Use structured filters: `req.body.filters`, `req.query.search` |
| `req.body.isAdmin` in routeArgs | **Self-escalation bypass.** Boolean admin flags in request body allow privilege escalation. | Server determines admin status from `req.user` context and RBAC rules |

**Password Handling Rules (MANDATORY):**
- User creation/update endpoints MUST accept `password` (plaintext), NOT `passwordHash`
- Signature example: `createUser(organisationId, email, password, role)` ✅
- Signature anti-pattern: `createUser(organisationId, email, passwordHash, role)` ❌
- Service layer hashes passwords before database storage
- API contract documents the plaintext password flow; implementation handles hashing

**Role Assignment Rules (CONDITIONAL):**
- `req.body.role` in routeArgs is **ALLOWED** when endpoint meets ALL criteria:
  - Endpoint has `requireRole` in middleware array
  - serviceContract has `rbac: "admin"` (admin-only access)
  - Role values validated against allowed enums (not open-ended strings)
- `req.body.role` is **BLOCKED** when:
  - Endpoint is user-accessible (rbac: null or rbac: "member")
  - Endpoint allows self-updates (e.g., PATCH /api/users/me)
- **Rationale:** Admins can assign roles to others, but users cannot escalate their own privileges

**If you see these patterns in generated output:**
1. STOP - do not proceed to Agent 6
2. Trace back to Agent 1 scope-manifest or product-definition
3. Fix the source specification to remove security anti-patterns
4. Regenerate service-contracts.json

### 7. Request Body Validation Rules

**CRITICAL RULE:** Every endpoint that reads `req.body` in its `routeArgs` MUST enforce body validation.

#### Required Fields by Body Usage

| routeArgs References `req.body` | middleware Must Include | serviceContract.acceptsBody | Rationale |
|----------------------------------|-------------------------|----------------------------|-----------|
| YES (any `req.body.*` present) | `validateBody` or `validateMultipart` | `true` | Body data requires validation before processing |
| NO (only params, query, user, file) | NOT `validateBody` | `false` | No body data to validate |

**Special case - Multipart uploads:**
- Endpoints with `fileUpload: true` that also accept form fields use `validateMultipart` instead of `validateBody`
- Both count as body validation middleware for enforcement purposes
- `acceptsBody` remains `true` when form fields are present alongside file

#### Enforcement Examples

**CORRECT: Body route with validation**
```json
{
  "path": "/api/projects",
  "method": "POST",
  "middleware": ["authenticate", "validateBody"],
  "serviceContract": {
    "routeArgs": ["req.user.organisationId", "req.body.name", "req.body.description"],
    "acceptsBody": true
  }
}
```

**CORRECT: Query-only POST with no body**
```json
{
  "path": "/api/reports/generate",
  "method": "POST",
  "middleware": ["authenticate"],
  "serviceContract": {
    "routeArgs": ["req.user.organisationId", "req.query.format", "req.query.startDate"],
    "acceptsBody": false
  }
}
```

**CORRECT: Multipart upload with form fields**
```json
{
  "path": "/api/uploads",
  "method": "POST",
  "middleware": ["authenticate", "fileUpload", "validateMultipart"],
  "serviceContract": {
    "routeArgs": ["req.user.organisationId", "req.file", "req.body.category"],
    "fileUpload": true,
    "acceptsBody": true
  }
}
```

**WRONG: Body route missing validation**
```json
{
  "path": "/api/projects",
  "method": "POST",
  "middleware": ["authenticate"],  // MISSING validateBody
  "serviceContract": {
    "routeArgs": ["req.user.organisationId", "req.body.name"],  // Uses req.body
    "acceptsBody": true  // Claims to accept body but no validation middleware
  }
}
```

#### Verification Requirements

The verify-body-validation.sh gate MUST enforce:
1. Any endpoint with `req.body.*` in routeArgs has `validateBody` or `validateMultipart` in middleware
2. Any endpoint with `validateBody` in middleware has `acceptsBody: true`
3. Any endpoint without `req.body` references has `acceptsBody: false`
4. Multipart uploads with form fields use `validateMultipart` and `acceptsBody: true`

---

## VERIFICATION GATES

Agent 4 must define verification scripts for Agent 6 to extract during build:

### scripts/verify-body-validation.sh
```bash
#!/bin/bash
set -euo pipefail

# Verify body validation middleware and acceptsBody alignment

SERVICE_CONTRACTS="docs/service-contracts.json"

if [[ ! -f "$SERVICE_CONTRACTS" ]]; then
  echo "[X] FAIL: service-contracts.json not found"
  exit 1
fi

echo "=== Verifying Body Validation Discipline ==="

# Capture output; || true prevents immediate exit under set -e
OUTPUT=$(python3 -c "
import json
import sys

with open('$SERVICE_CONTRACTS') as f:
    data = json.load(f)

violations = []

for endpoint in data['endpoints']:
    path = endpoint['path']
    method = endpoint['method']
    middleware = endpoint.get('middleware', [])
    service_contract = endpoint.get('serviceContract', {})
    route_args = service_contract.get('routeArgs', [])
    accepts_body = service_contract.get('acceptsBody', False)
    file_upload = service_contract.get('fileUpload', False)
    
    # Check if routeArgs references req.body
    uses_body = any('req.body' in str(arg) for arg in route_args)
    
    # Check for validation middleware (validateBody or validateMultipart)
    has_validate_body = 'validateBody' in middleware
    has_validate_multipart = 'validateMultipart' in middleware
    has_body_validation = has_validate_body or has_validate_multipart
    
    # Rule 1: If routeArgs uses req.body, MUST have body validation middleware
    if uses_body and not has_body_validation:
        violations.append(f'{method} {path}: routeArgs uses req.body but missing validateBody/validateMultipart')
    
    # Rule 2: If has validateBody middleware, MUST have acceptsBody: true
    if has_validate_body and not accepts_body:
        violations.append(f'{method} {path}: has validateBody but acceptsBody is false')
    
    # Rule 3: If does not use req.body and is POST/PUT/PATCH, MUST have acceptsBody: false
    if not uses_body and method in ['POST', 'PUT', 'PATCH'] and accepts_body:
        violations.append(f'{method} {path}: does not use req.body but acceptsBody is true')
    
    # Rule 4: Multipart with form fields should use validateMultipart
    if file_upload and uses_body and not has_validate_multipart:
        violations.append(f'{method} {path}: file upload with form fields should use validateMultipart')

if violations:
    for v in violations:
        print(v)
    sys.exit(1)
" 2>&1 || true)

# If output doesn't contain expected PASS, then violations were found
if [[ -n "$OUTPUT" ]]; then
  echo "[X] FAIL: Body validation violations detected:"
  echo "$OUTPUT"
  exit 1
fi

echo "[✓] PASS: Body validation discipline verified"
```

### scripts/verify-organisation-endpoint-naming.sh
```bash
#!/bin/bash
set -euo pipefail

# Verify organisation endpoint follows singleton pattern
SERVICE_CONTRACTS="docs/service-contracts.json"

if [[ ! -f "$SERVICE_CONTRACTS" ]]; then
  echo "[X] FAIL: service-contracts.json not found"
  exit 1
fi

# Check for forbidden patterns
FORBIDDEN_PATTERNS=$(python3 -c "
import json
with open('$SERVICE_CONTRACTS') as f:
    data = json.load(f)
    forbidden = []
    for endpoint in data['endpoints']:
        path = endpoint['path']
        
        # Split path into segments for proper matching
        segments = [seg for seg in path.split('/') if seg]
        
        if len(segments) >= 2 and segments[0] == 'api':
            # Check for organisation-related paths only
            if segments[1] == 'organisation':
                # Singular form is forbidden
                forbidden.append(path)
            elif segments[1] == 'organisations':
                # Plural form: only allow /me and /me/* patterns
                if len(segments) < 3 or segments[2] != 'me':
                    forbidden.append(path)
    
    if forbidden:
        print('\n'.join(forbidden))
    else:
        print('none')
")

# Check for valid patterns  
VALID_PATTERNS=$(python3 -c "
import json
with open('$SERVICE_CONTRACTS') as f:
    data = json.load(f)
    org_endpoints = []
    invalid = []
    
    for endpoint in data['endpoints']:
        path = endpoint['path']
        segments = [seg for seg in path.split('/') if seg]
        
        # Only check paths that are actually organisation endpoints
        if len(segments) >= 2 and segments[0] == 'api':
            if segments[1] == 'organisation':
                org_endpoints.append(path)
                invalid.append(path)  # All singular forms invalid
            elif segments[1] == 'organisations':
                org_endpoints.append(path)
                # Check if it follows /me pattern
                if len(segments) < 3 or segments[2] != 'me':
                    invalid.append(path)
    
    if org_endpoints:
        print(f'Total organisation endpoints: {len(org_endpoints)}')
        if invalid:
            print('Invalid patterns:')
            for p in invalid:
                print(f'  {p}')
        else:
            print('All valid')
    else:
        print('No organisation endpoints found')
")

if [[ "$FORBIDDEN_PATTERNS" != "none" ]]; then
  echo "[X] FAIL: Forbidden organisation endpoint patterns detected:"
  echo "$FORBIDDEN_PATTERNS"
  echo ""
  echo "Organisation endpoints MUST use /api/organisations/me pattern (singleton)"
  echo "Never use /api/organisation (singular) or /api/organisations/:id (parameterised)"
  exit 1
fi

echo "[✓] PASS: Organisation endpoint naming verified"
echo "$VALID_PATTERNS"
```

### scripts/verify-mvp-scope-boundaries.sh
```bash
#!/bin/bash
set -euo pipefail

# Verify platform-level resources respect MVP scope boundaries
# Cross-reference against scope-manifest MVP declarations

SCOPE_MANIFEST="docs/scope-manifest.json"
SERVICE_CONTRACTS="docs/service-contracts.json"

if [[ ! -f "$SCOPE_MANIFEST" || ! -f "$SERVICE_CONTRACTS" ]]; then
  echo "[X] FAIL: Required files missing"
  exit 1
fi

# Extract entities marked as MVP read-only from scope-manifest
PREBUILT_ENTITIES=$(python3 -c "
import json
with open('$SCOPE_MANIFEST') as f:
    data = json.load(f)
    prebuilt = []
    for name, contract in data['entityContracts'].items():
        # Check mvpScope enum variations
        mvp_scope = str(contract.get('mvpScope', '')).lower()
        mvp_readonly = mvp_scope in ['read-only', 'readonly', 'prebuilt', 'pre-built']
        
        # Check businessRules array for pre-built indicators  
        business_rules = contract.get('businessRules', [])
        if isinstance(business_rules, list):
            business_text = ' '.join(business_rules).lower()
        else:
            business_text = str(business_rules).lower()
        
        business_readonly = any(indicator in business_text for indicator in 
                               ['pre-built', 'prebuilt', 'read-only', 'readonly', 
                                'platform primitive', 'user select only'])
        
        if mvp_readonly or business_readonly:
            prebuilt.append(name)
    print(','.join(prebuilt))
")

# Verify pre-built entities have mutation endpoints deferred
for entity in ${PREBUILT_ENTITIES//,/ }; do
  MUTATION_EXPOSED=$(python3 -c "
import json
import sys
with open('$SERVICE_CONTRACTS') as f:
    data = json.load(f)
    mutations = ['POST', 'PATCH', 'PUT', 'DELETE']
    entity_name = '${entity,,}'
    
    for endpoint in data['endpoints']:
        path = endpoint['path']
        method = endpoint['method'] 
        status = endpoint['status']
        
        if method not in mutations or status != 'required':
            continue
            
        # Extract path segments for proper matching
        path_segments = [seg for seg in path.split('/') if seg]
        
        # Check if this endpoint targets our entity via proper path structure
        # Match patterns: /api/<entity> or /api/<entity-plural> or /api/<entity>s
        entity_match = False
        if len(path_segments) >= 2 and path_segments[0] == 'api':
            second_segment = path_segments[1]
            # Check exact match, plural form, and common hyphenated variants
            if (second_segment == entity_name or 
                second_segment == entity_name + 's' or
                second_segment.replace('-', '') == entity_name.replace('-', '') or
                second_segment.replace('-', '') == entity_name.replace('-', '') + 's'):
                entity_match = True
        
        if entity_match:
            print(f'{method} {path}')
" 2>/dev/null)
  
  if [[ -n "$MUTATION_EXPOSED" ]]; then
    echo "[X] FAIL: Pre-built entity '${entity}' has exposed mutation endpoints:"
    echo "$MUTATION_EXPOSED"
    echo "These should be deferred per MVP scope boundary"
    exit 1
  fi
done

echo "[✓] PASS: MVP scope boundaries respected"
```

### scripts/verify-token-scoped-routing.sh
```bash
#!/bin/bash
set -euo pipefail

# Verify organisation-scoped endpoints use req.user.organisationId
# Cross-references data-relationships.json to skip platform-level resources

SERVICE_CONTRACTS="docs/service-contracts.json"
DATA_RELATIONSHIPS="docs/data-relationships.json"

if [[ ! -f "$SERVICE_CONTRACTS" ]]; then
  echo "[X] FAIL: service-contracts.json not found"
  exit 1
fi

if [[ ! -f "$DATA_RELATIONSHIPS" ]]; then
  echo "[X] FAIL: data-relationships.json not found (required to determine tenant scope)"
  exit 1
fi

echo "=== Verifying Token-Scoped Routing ==="

# Capture output; || true prevents immediate exit under set -e
OUTPUT=$(python3 -c "
import json
import re

with open('$SERVICE_CONTRACTS') as f:
    contracts = json.load(f)

with open('$DATA_RELATIONSHIPS') as f:
    relationships = json.load(f)

violations = []

for endpoint in contracts['endpoints']:
    path = endpoint['path']
    method = endpoint['method']
    service_contract = endpoint.get('serviceContract', {})
    route_args = service_contract.get('routeArgs', [])
    auth_required = service_contract.get('authRequired', False)
    
    # Skip framework endpoints
    if path in ['/health', '/api/auth/login', '/api/auth/register', '/api/auth/session']:
        continue
    
    # Skip endpoints that explicitly don't require auth
    if not auth_required:
        continue
    
    # Extract entity name from path
    path_segments = [seg for seg in path.split('/') if seg]
    
    if len(path_segments) < 2 or path_segments[0] != 'api':
        continue
    
    second_segment = path_segments[1]
    
    # Skip auth and organisations/me endpoints
    if second_segment == 'auth':
        continue
    if second_segment == 'organisations' and len(path_segments) >= 3 and path_segments[2] == 'me':
        continue
    
    # Derive entity name from path
    # Convert plural form to singular and handle hyphenated names
    entity_name = second_segment.rstrip('s')  # Simple pluralization
    
    # Look up entity in data-relationships.json
    tenant_key = None
    for entity_data in relationships.get('entities', []):
        if entity_data.get('name') == entity_name or entity_data.get('name') == second_segment:
            tenant_key = entity_data.get('tenantKey')
            break
    
    # If entity not found in relationships, try common variations
    if tenant_key is None:
        # Try hyphenated singular forms
        variations = [
            second_segment,
            second_segment.replace('-', ''),
            entity_name,
            entity_name.replace('-', '')
        ]
        for entity_data in relationships.get('entities', []):
            entity_canonical = entity_data.get('name', '').replace('-', '')
            for variant in variations:
                if entity_canonical == variant.replace('-', ''):
                    tenant_key = entity_data.get('tenantKey')
                    break
            if tenant_key:
                break
    
    # Skip if we can't determine tenant scope (conservative: don't flag unknown entities)
    if tenant_key is None:
        continue
    
    # Skip platform-level resources (tenantKey: 'none')
    if tenant_key == 'none':
        continue
    
    # For tenant-scoped resources (tenantKey: 'direct'), require req.user.organisationId
    if tenant_key == 'direct':
        has_org_id = any('req.user.organisationId' in str(arg) for arg in route_args)
        
        if not has_org_id:
            violations.append(f'{method} {path}: tenant-scoped resource missing req.user.organisationId in routeArgs')

if violations:
    for v in violations:
        print(v)
    import sys
    sys.exit(1)
" 2>&1 || true)

# If output is non-empty, violations were found
if [[ -n "$OUTPUT" ]]; then
  echo "[X] FAIL: Token-scoped routing violations:"
  echo "$OUTPUT"
  exit 1
fi

echo "[✓] PASS: All tenant-scoped endpoints use req.user.organisationId"
echo "(Platform-level resources with tenantKey='none' correctly excluded)"
```

### scripts/verify-upload-config-sourced.sh
```bash
#!/bin/bash
set -euo pipefail

# Verify fileUploadConfig values match scope-manifest platformConstraints

SCOPE_MANIFEST="docs/scope-manifest.json"
SERVICE_CONTRACTS="docs/service-contracts.json"

if [[ ! -f "$SCOPE_MANIFEST" || ! -f "$SERVICE_CONTRACTS" ]]; then
  echo "[X] FAIL: Required files missing"
  exit 1
fi

echo "=== Verifying Upload Config Sourcing ==="

# Check if fileUploadConfig exists in service-contracts.json
HAS_UPLOAD_CONFIG=$(jq -e '.fileUploadConfig' "$SERVICE_CONTRACTS" > /dev/null 2>&1 && echo "true" || echo "false")

if [[ "$HAS_UPLOAD_CONFIG" == "false" ]]; then
  echo "[SKIP] No fileUploadConfig in service-contracts.json"
  exit 0
fi

# Check if platformConstraints exists in scope-manifest.json
HAS_PLATFORM_CONSTRAINTS=$(jq -e '.platformConstraints' "$SCOPE_MANIFEST" > /dev/null 2>&1 && echo "true" || echo "false")

if [[ "$HAS_PLATFORM_CONSTRAINTS" == "false" ]]; then
  echo "[X] FAIL: fileUploadConfig present but scope-manifest has no platformConstraints"
  echo "Rule: fileUploadConfig values MUST be sourced from platformConstraints"
  exit 1
fi

# Compare each field
OUTPUT=$(python3 -c "
import json
import sys

with open('$SCOPE_MANIFEST') as f:
    scope_data = json.load(f)
with open('$SERVICE_CONTRACTS') as f:
    contract_data = json.load(f)

platform_constraints = scope_data.get('platformConstraints', {})
upload_config = contract_data.get('fileUploadConfig', {})

violations = []

# Field mapping: uploadConfig field -> platformConstraints field
field_mapping = {
    'maxSizeMb': 'maxUploadSizeMb',
    'maxRecordsPerJob': 'maxRecordsPerJob',
    'retentionDays': 'dataRetentionDays',
    'encryption': 'encryptionStandard'
}

for config_field, constraint_field in field_mapping.items():
    if config_field in upload_config:
        config_value = upload_config[config_field]
        constraint_value = platform_constraints.get(constraint_field)
        
        # Skip if marked as 'unspecified' (allowed per Section 5)
        if config_value == 'unspecified':
            continue
        
        if constraint_value is None:
            violations.append(f'{config_field}: value {config_value} in config but {constraint_field} missing in platformConstraints')
        elif config_value != constraint_value:
            violations.append(f'{config_field}: {config_value} != platformConstraints.{constraint_field}: {constraint_value}')

# Check allowedMimeTypes (array comparison)
if 'allowedMimeTypes' in upload_config:
    config_mimes = set(upload_config['allowedMimeTypes'])
    constraint_mimes = set(platform_constraints.get('supportedMimeTypes', []))
    
    # Skip if marked as unspecified
    if upload_config['allowedMimeTypes'] != ['unspecified']:
        if not constraint_mimes:
            violations.append('allowedMimeTypes: values present in config but supportedMimeTypes missing in platformConstraints')
        elif config_mimes != constraint_mimes:
            violations.append(f'allowedMimeTypes: {sorted(config_mimes)} != platformConstraints.supportedMimeTypes: {sorted(constraint_mimes)}')

if violations:
    for v in violations:
        print(v)
    sys.exit(1)
" 2>&1 || true)

# If output is non-empty, violations were found
if [[ -n "$OUTPUT" ]]; then
  echo "[X] FAIL: Upload config sourcing violations:"
  echo "$OUTPUT"
  echo ""
  echo "Rule: fileUploadConfig values MUST match scope-manifest platformConstraints"
  echo "Either fix the values or omit fileUploadConfig if platformConstraints is missing"
  exit 1
fi

echo "[✓] PASS: Upload config sourcing verified"
```

---

## FILE OUTPUT MANIFEST

Agent 4 generates specification files only. Gate scripts listed above are **specifications for Agent 6** to extract and generate during build. DO NOT CREATE script files directly.

| File | Path | Type | Required | Authority |
|------|------|------|----------|-----------|
| API Contracts | docs/service-contracts.json | Machine artifact | YES | **AUTHORITATIVE** |

**CRITICAL STRUCTURE REQUIREMENTS:**

The service-contracts.json file MUST use:
- Schema: `"$schema": "service-contracts-v2"` (NOT v1)
- Top-level key: `"endpoints": [...]` (NOT "routes")
- These requirements are non-negotiable - incorrect structure will silently disable all verification gates

**CRITICAL**: service-contracts.json is the single source of truth. No derived projection files.

**Security constraints (BLOCKING VIOLATIONS - see Section 6):**
- NEVER include `req.body.passwordHash` in routeArgs (use `req.body.password` instead)
- NEVER include `req.body.token` or `req.body.jwt` in routeArgs (tokens come from headers)
- NEVER include `req.body.sql` or `req.body.query` in routeArgs (SQL injection vector)
- NEVER include `req.body.isAdmin` in routeArgs (self-escalation bypass)
- `req.body.role` ALLOWED only in admin-only endpoints (requireRole + rbac: "admin"), BLOCKED in user-accessible endpoints

**Human documentation constraints:**
- Cannot assert capabilities not present in service-contracts.json
- Must mark any assumptions as "out-of-scope assumption" 
- No claims about features not explicitly defined in machine contract
- File upload constraints must reference fileUploadConfig section with correct 5-field schema
- Organisation endpoint uses `/api/organisations/me` pattern for singleton access
- Optional documentation fields (requestBody, queryParams, pathParams) are not enforced by gates

Gate scripts defined in this document are specifications only - Agent 6 creates them during build.

---

## EXAMPLE OUTPUT STRUCTURE

**CRITICAL STRUCTURE REQUIREMENTS:**
- **Schema version MUST be:** `"$schema": "service-contracts-v2"` (NOT v1)
- **Top-level key MUST be:** `"endpoints"` (NOT "routes")
- **Deferred handling policy:** `"deferredRouteHandling": "excludeFromRegistration"` (recommended - deferred endpoints exist in spec but are not registered in route handlers)
- **fileUploadConfig schema:** EXACTLY 5 fields only (maxSizeMb, allowedMimeTypes, maxRecordsPerJob, retentionDays, encryption) - NO implementation fields (maxFileSize, fileFieldName, tempStoragePath, multipleFilesAllowed, etc.)
- **These are hard requirements** - Agent 6 gates will silently fail with incorrect structure

```json
{
  "$schema": "service-contracts-v2",
  "deferredRouteHandling": "excludeFromRegistration",
  "endpoints": [
    {
      "path": "/health",
      "method": "GET",
      "status": "required",
      "routeFile": "server/routes/health.routes.ts",
      "middleware": [],
      "authentication": "public",
      "serviceContract": {
        "serviceFile": "server/services/health.service.ts",
        "methodName": "getHealthStatus",
        "signature": "getHealthStatus()",
        "routeArgs": [],
        "purpose": "getHealthStatus",
        "authRequired": false,
        "rbac": null,
        "fileUpload": false,
        "acceptsBody": false,
        "notes": "Framework health check. Public access for monitoring."
      }
    },
    {
      "path": "/api/organisations/me",
      "method": "GET",
      "status": "required",
      "routeFile": "server/routes/organisations.routes.ts",
      "middleware": ["authenticate"],
      "authentication": "required",
      "serviceContract": {
        "serviceFile": "server/services/organisations.service.ts",
        "methodName": "getCurrentOrganisation",
        "signature": "getCurrentOrganisation(organisationId)",
        "routeArgs": ["req.user.organisationId"],
        "purpose": "getCurrentOrganisation",
        "authRequired": true,
        "rbac": null,
        "fileUpload": false,
        "acceptsBody": false,
        "notes": "Organisation is a singleton container resource for the current tenant."
      }
    },
    {
      "path": "/api/canonical-schemas",
      "method": "GET",
      "status": "required",
      "routeFile": "server/routes/canonicalSchemas.routes.ts",
      "middleware": ["authenticate"],
      "authentication": "required",
      "serviceContract": {
        "serviceFile": "server/services/canonicalSchemas.service.ts", 
        "methodName": "listCanonicalSchemas",
        "signature": "listCanonicalSchemas(page, limit, category)",
        "routeArgs": ["req.query.page", "req.query.limit", "req.query.category"],
        "purpose": "listCanonicalSchemas",
        "authRequired": true,
        "rbac": null,
        "fileUpload": false,
        "acceptsBody": false,
        "notes": "Platform-level resource. Not tenant-scoped - available to all authenticated users for schema selection."
      }
    },
    {
      "path": "/api/canonical-schemas",
      "method": "POST", 
      "status": "deferred",
      "routeFile": "server/routes/canonicalSchemas.routes.ts",
      "middleware": ["authenticate", "requireRole", "validateBody"],
      "authentication": "required",
      "serviceContract": {
        "serviceFile": "server/services/canonicalSchemas.service.ts",
        "methodName": "createCanonicalSchema", 
        "signature": "createCanonicalSchema(name, version, category, schemaDefinition)",
        "routeArgs": ["req.body.name", "req.body.version", "req.body.category", "req.body.schemaDefinition"],
        "purpose": "createCanonicalSchema",
        "authRequired": true,
        "rbac": "admin",
        "fileUpload": false,
        "acceptsBody": true,
        "notes": "Deferred to post-MVP. Canonical schemas are pre-built platform primitives in MVP - users select, not author."
      }
    },
    {
      "path": "/api/data-sources/upload",
      "method": "POST",
      "status": "required",
      "routeFile": "server/routes/dataSources.routes.ts",
      "middleware": ["authenticate", "fileUpload", "validateMultipart"],
      "authentication": "required",
      "serviceContract": {
        "serviceFile": "server/services/dataSources.service.ts",
        "methodName": "uploadDataSource",
        "signature": "uploadDataSource(organisationId, file, category, description)",
        "routeArgs": ["req.user.organisationId", "req.file", "req.body.category", "req.body.description"],
        "purpose": "uploadDataSource",
        "authRequired": true,
        "rbac": null,
        "fileUpload": true,
        "acceptsBody": true,
        "notes": "CRITICAL: File upload WITH form fields uses validateMultipart (not validateBody). Upload-only endpoints without form fields omit validateMultipart."
      }
    }
  ],
  "fileUploadConfig": {
    "maxSizeMb": 100,
    "allowedMimeTypes": ["text/csv", "application/json", "application/vnd.ms-excel"],
    "maxRecordsPerJob": 100000,
    "retentionDays": 30,
    "encryption": "AES-256-GCM"
  }
}
```

**NOTE:** The fileUploadConfig section above shows the EXACT 5-field structure required. DO NOT add fields like maxFileSize, tempStoragePath, fileFieldName, or multipleFilesAllowed.

---

## PROMPT HYGIENE GATE

- [OK] Framework: Production Final
- [OK] Constitution: Active
- [OK] REFERENCES table present (Section Y compliant) 
- [OK] No inline version numbers in body text
- [OK] MVP scope boundary validation mandatory
- [OK] Platform-level resource handling explicit
- [OK] Verification gates defined: 5 gates (body validation, upload config sourcing, organisation naming, MVP boundaries, token scoping with data-relationships cross-reference)
- [OK] Gate scripts robust under set -euo pipefail (OUTPUT=$(... || true) pattern, not $? check)
- [OK] FILE OUTPUT MANIFEST present (single source of truth: service-contracts.json)
- [OK] CRITICAL STRUCTURE REQUIREMENTS: schema v2, endpoints key, fileUploadConfig EXACTLY 5 fields only, deferredRouteHandling standardized
- [OK] Section 5 fileUploadConfig: CRITICAL GENERATION REQUIREMENT with "ONLY these 5 fields" enforcement, REQUIRED FIELDS table, expanded BANNED FIELDS list (8 banned fields), concrete example, "DO NOT ADD ANY OTHER FIELDS" rule
- [OK] EXAMPLE OUTPUT STRUCTURE: fileUploadConfig example with NOTE emphasizing exact 5-field structure
- [OK] Section 6 Security Anti-Patterns: passwordHash, token-in-body, SQL injection, isAdmin violations documented; role assignment conditional (allowed in admin-only endpoints)
- [OK] No references to deprecated artefacts (route-service-contracts.json, 04-API-CONTRACT.md removed)
- [OK] Body validation rules explicit with enforcement gate (Section 7)
- [OK] Multipart upload requirement in Section 4 Service Contract Requirements
- [OK] Multipart upload example in EXAMPLE OUTPUT STRUCTURE with explicit notes
- [OK] Upload middleware naming consistent: "fileUpload" everywhere
- [OK] fileUploadConfig verification enforced by verify-upload-config-sourced.sh gate
- [OK] Optional documentation fields clarified (requestBody, queryParams not enforced)
- [OK] verify-token-scoped-routing.sh cross-references data-relationships.json to distinguish tenant-scoped vs platform-level resources

**Status:** Production Ready

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 98 | 2026-02 | **Token Scoping Gate Platform-Level Resource Fix:** Updated verify-token-scoped-routing.sh to cross-reference data-relationships.json and skip platform-level resources (tenantKey: "none"). (1) Added DATA_RELATIONSHIPS file requirement. (2) Added entity name derivation logic with plural/singular and hyphenation handling. (3) Added tenantKey lookup with fallback variations. (4) Skip verification for platform-level resources (tenantKey: "none"). (5) Only enforce req.user.organisationId for tenant-scoped resources (tenantKey: "direct"). (6) Updated success message to clarify platform-level exclusion. Addresses feedback on service-contracts.json where valid platform-level endpoints (canonical-schemas, processing-pipelines, api-connectors) would fail gate despite not requiring tenant scoping. |
| 97 | 2026-02 | **fileUploadConfig Schema Enforcement Strengthening (Output Regression Fix):** Fixed schema regression where output still contained banned implementation fields despite v96 rules. (1) Added CRITICAL GENERATION REQUIREMENT to Section 5 with explicit "EXACTLY 5 fields and NO OTHER FIELDS" enforcement. (2) Expanded BANNED FIELDS list from 4 to 8 items (added multipleFilesAllowed, maxFiles, storageEngine, preservePath). (3) Added concrete example with "copy this exactly" instruction. (4) Added "DO NOT ADD ANY OTHER FIELDS" rule. (5) Added fileUploadConfig to CRITICAL STRUCTURE REQUIREMENTS in EXAMPLE OUTPUT STRUCTURE. (6) Added fileUploadConfig example to EXAMPLE OUTPUT STRUCTURE with explicit NOTE. Addresses feedback on service-contracts.json output containing maxFileSize, tempStoragePath, fileFieldName, multipleFilesAllowed instead of required 5-field schema. |
| 96 | 2026-02 | **Gate Script Robustness Fix (set -e Brittleness):** Fixed 3 gate scripts to preserve diagnostic output under `set -euo pipefail`. (1) verify-body-validation.sh: Changed pattern from `VIOLATIONS=$(python... sys.exit(1))` + `if [[ $? -ne 0 ]]` to `OUTPUT=$(python... || true)` + `if [[ -n "$OUTPUT" ]]`. (2) verify-token-scoped-routing.sh: Same pattern fix. (3) verify-upload-config-sourced.sh: Same pattern fix. Previous pattern caused immediate script exit on violations before diagnostic output could run (gates still failed builds but lost helpful error messages). Addresses feedback on prevention-first clarity requirements. |
| 95 | 2026-02 | **Role Assignment Rule Fix (Internal Contradiction):** Fixed blanket ban on `req.body.role` that contradicted legitimate admin flows. (1) Removed `req.body.role` from BLOCKING VIOLATIONS table (kept `req.body.isAdmin` as absolute ban). (2) Added "Role Assignment Rules (CONDITIONAL)" section: allows `req.body.role` in admin-only endpoints (requireRole + rbac: "admin"), blocks in user-accessible endpoints. (3) Updated FILE OUTPUT MANIFEST security constraints with conditional rule. Resolves v94 contradiction where security anti-pattern banned role field used in correct signature example. Addresses feedback on v94 internal inconsistency. |
| 94 | 2026-02 | **fileUploadConfig Field Enforcement & Security Anti-Patterns:** (1) Added explicit REQUIRED FIELDS table with exact field names for fileUploadConfig (maxSizeMb, allowedMimeTypes, maxRecordsPerJob, retentionDays, encryption). (2) Added BANNED FIELDS table preventing implementation details (maxFileSize, fileFieldName, tempStoragePath, uploadDestination) from appearing in API contracts. (3) Added Section 6: Security Anti-Patterns with BLOCKING VIOLATIONS table preventing passwordHash, token in body, SQL injection, and role-setting patterns. (4) Updated Section 4 reference from Section 6 to Section 7 (body validation rules renumbered). Addresses feedback on service-contracts.json output: wrong fileUploadConfig fields and passwordHash security leak. |
| 93 | 2026-02 | **deferredRouteHandling Consistency Fix:** Standardized deferredRouteHandling value in EXAMPLE OUTPUT STRUCTURE to "excludeFromRegistration" (was "includeAll"). Added deferred handling policy explanation to CRITICAL STRUCTURE REQUIREMENTS. Ensures example matches actual output behavior where deferred endpoints exist in spec but are not registered in route handlers. Addresses feedback on v92 semantic toggle inconsistency. |
| 92 | 2026-02 | **Critical Structure Enforcement & Documentation Clarity:** (1) Added CRITICAL STRUCTURE REQUIREMENTS to EXAMPLE OUTPUT STRUCTURE: schema MUST be service-contracts-v2 (not v1), top-level key MUST be "endpoints" (not "routes"). (2) Strengthened Section 5 fileUploadConfig: added explicit REQUIRED FIELDS list including encryption (all 5 fields must be present or marked "unspecified"). (3) Added "Optional documentation fields" section clarifying requestBody/queryParams/pathParams are not enforced by gates. (4) Updated FILE OUTPUT MANIFEST with explicit structure requirements and gate impact warning. (5) Updated prompt hygiene gate with structure and documentation checks. Addresses feedback on service-contracts.json v91 output quality (wrong schema, wrong key, missing encryption). |
| 91 | 2026-02 | **Validation Date Removal:** Removed non-deterministic "Validation Date: 2026-02-07" from prompt hygiene gate to prevent diff noise and churn. No functional changes. Addresses feedback on v90 minor nit. |
| 90 | 2026-02 | **Middleware Naming Consistency Fix:** Fixed remaining uploadMiddleware reference in Section 6 CORRECT example to use fileUpload (was "uploadMiddleware", should be "fileUpload"). Completes v89 middleware standardization. All examples now consistent with "middleware name is fileUpload" rule. Addresses feedback on v89 inconsistent example. |
| 89 | 2026-02 | **Upload Config Verification Enforcement & Middleware Naming Consistency:** (1) Added verify-upload-config-sourced.sh gate specification enforcing fileUploadConfig sourcing from platformConstraints (fixes unenforced verification promise). (2) Standardized upload middleware naming to "fileUpload" everywhere (was inconsistent "uploadMiddleware" vs "fileUpload"). (3) Updated Section 5 to reference correct gate. (4) Added explicit "no validation middleware" guidance for upload-only endpoints. Total gates: 5 (body validation, upload config sourcing, organisation naming, MVP boundaries, token scoping). Addresses feedback on v88 framework gaps. |
| 88 | 2026-02 | **Multipart Upload Enforcement & Config Verification Strengthening:** (1) Added CRITICAL multipart requirement to Section 4 Service Contract Requirements (fileUpload + req.body → validateMultipart not validateBody). (2) Added multipart upload example to EXAMPLE OUTPUT STRUCTURE with explicit notes. (3) Strengthened Section 5 fileUploadConfig rules: added VERIFICATION BLOCKER requirement and explicit "no defaults" rule. (4) Fixes defect where upload endpoints with form fields incorrectly used validateBody instead of validateMultipart. Addresses feedback on service-contracts.json v87 output quality. |
| 87 | 2026-02 | **Body Validation Discipline & Artefact Consolidation:** (1) Added Section 6: Request Body Validation Rules with enforcement table and multipart handling. (2) Added verify-body-validation.sh gate enforcing req.body -> validateBody/validateMultipart discipline. (3) Removed route-service-contracts.json and 04-API-CONTRACT.md from FILE OUTPUT MANIFEST (consolidated to single source of truth). (4) Removed verify-route-map-sync.sh gate (no longer needed without derived artefact). (5) Removed "Enhanced Route Mapping" example section. (6) Added acceptsBody field to serviceContract schema in Section 4. Total gates: 4 (body validation, organisation naming, MVP boundaries, token scoping). |
| 86 | 2026-02 | **Framework Compliance:** Converted to Linked Documents format per Constitution v7.0 Section Y. Removed all version pins from FRAMEWORK/REFERENCES sections and document body. Retained version numbers only in Version Reference header and VERSION HISTORY table. No structural changes to logic or verification gates. |
| 85 | 2026-02 | **Route Map Schema Alignment:** Fixed route-service-contracts.json to use `routeFile` key (matches verifier expectations, prevents build failures). Enhanced middleware selection guidance (prevents inappropriate validateProjectAccess on user routes). Added framework endpoint clarification (session validation requires authentication). Resolves key naming mismatch blocker. |
| 84 | 2026-02 | Dependency pins synchronised: Agent 0 v6.1 -> v6.2, Agent 1 v34 -> v35, Agent 3 v42 -> v43. |
| 83 | 2026-02 | Dependency pins synchronised: Agent 1 v33 -> v34, Agent 3 v41 -> v42. |
| 82 | 2026-02 | Dependency pins synchronised: Agent 1 v32 -> v33, Agent 3 v40 -> v41. |
| 81 | 2026-02 | Dependency pins synchronised: Agent 1 v31 -> v32, Agent 3 v39 -> v40. |
| 80 | 2026-02 | Dependency pins synchronised: Agent 1 v30 -> v31, Agent 3 v38 -> v39. |
| 79 | 2026-02 | Dependency pins synchronised: Agent 1 v29 -> v30, Agent 3 v37 -> v38. |
| 78 | 2026-02 | Dependency pins synchronised: Agent 1 v28 -> v29, Agent 3 v36 -> v37. |
| 77 | 2026-02 | **Framework Compliance:** Fixed version hygiene violations (removed version pins from FRAMEWORK/REFERENCES sections). Enhanced MVP scope boundary gate script robustness (proper array handling for businessRules, case-insensitive enum detection). Added .md extensions to linked documents. |
| 76 | 2026-02 | **MVP Scope Boundary Validation:** Added mandatory cross-reference against scope-manifest for platform-level resources. Pre-built entities (like canonicalSchemas) now correctly defer mutation endpoints. Added verify-mvp-scope-boundaries.sh gate. Fixes canonical schema creation exposure issue. |
| 75 | 2026-02 | Upload field placement, validateBody consistency fixes, config source attribution rule. |
| 74 | 2026-02 | Cross-artifact sync verification, route-service alignment gates. |

---

## DOCUMENT END

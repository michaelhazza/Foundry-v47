# Agent 5: UI/UX Specification

## Version Reference
- **This Document**: agent-5-ui-specification.md v69
- **Linked Documents**:
 - agent-0-constitution.md
 - agent-1-product-definition.md
 - agent-4-api-contract.md

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 69 | 2026-02 | **Internal Consistency Fix (Documentation Update):** Fixed two internal documentation inconsistencies from v68 to prevent drift and ensure Agent 6 handoff clarity. (1) Updated DOWNSTREAM HANDOFF: Split dependsOn bullet into two bullets - one for API response parameter sourcing (dependsOn) and one for UI-state parameter sourcing (paramSource). Ensures Agent 6 implements both parameter sourcing mechanisms. (2) Updated PROMPT HYGIENE GATE: Changed parameter sourcing line from "MUST have dependsOn field" to "MUST have dependsOn OR paramSource field" to match Rule 2 and Scan 2 requirements. (3) Updated PROMPT HYGIENE GATE: Added paramSource to Example JSON patterns line. No schema or rule changes - pure documentation consistency fix. Addresses feedback on v68: PROMPT HYGIENE GATE outdated (said dependsOn-only), DOWNSTREAM HANDOFF missing paramSource mention. |
| 68 | 2026-02 | **canonicalPaths & paramSource Type Enforcement (Output Quality Fix):** Fixed two schema blockers from v67 output. (1) Added FORBIDDEN PATTERNS #6: paramSource wrong type - shows WRONG (string: "selectedUser") vs CORRECT (object: {"id": "selected user row"}). Emphasizes paramSource MUST be object where keys are exact parameter names from path. (2) Strengthened FORBIDDEN PATTERNS #2: canonicalPaths EXACTLY 3 keys emphasis (apiClient/errorBoundary/appComponent), shows route map as WRONG. (3) Strengthened paramSource field definition: MUST be object (not string), keys must match parameter names exactly, added WRONG/CORRECT examples, cross-reference FORBIDDEN PATTERNS #6. (4) Strengthened Scan 11: Check paramSource is object type (not string), verify object keys match path parameters (e.g., :id → {"id": "..."}), verify meaningful values, updated report message. (5) Strengthened Scan 12: Verify canonicalPaths has EXACTLY 3 keys (apiClient/errorBoundary/appComponent), flag if different keys or count, updated report message. (6) Strengthened Rule 9: Added CRITICAL reminder to check ALL admin endpoints (if page has 5 admin calls, ALL 5 need requiredRole). (7) Updated UsersPage example: Added GET /api/users/:id with requiredRole: "admin" and paramSource object. (8) Updated verification table: Scan 11 message now "objects with parameter keys", Scan 12 message now "exactly 3 keys". (9) Updated stop-gate: References 6 patterns (was unspecified), requires Scan 11 and Scan 12 pass. Addresses feedback on v67 output: canonicalPaths still route map (not frozen UI paths), paramSource still string (not object), missing requiredRole on GET /api/users/:id. |
| 67 | 2026-02 | **Schema Enforcement Hardening (Output Contract Fix):** Fixed schema violations in v66 output by adding explicit anti-patterns and validation. (1) Added FORBIDDEN PATTERNS section with 5 blocking schema violations: wrong page schema (v1 fields), wrong canonicalPaths (route map instead of frozen UI paths), missing authRequired, page-level pathParamMap, duplicate route fields. (2) Added Scan 12: Schema validation checking $schema value, canonicalPaths structure, page required/forbidden fields, API call authRequired presence. (3) Strengthened Mandatory Top-Level Fields with CRITICAL warnings and FORBIDDEN PATTERNS cross-references. (4) Strengthened Mandatory Page Fields with v2 schema emphasis, explicit field name requirements (filePath NOT component, routePath NOT path, authenticated boolean NOT string), page-level pathParamMap prohibition. (5) Strengthened Mandatory API Call Fields with authRequired MANDATORY emphasis and schema violation reference. (6) Updated verification table to 12 scans. (7) Updated MANDATORY OUTPUT FORMAT to 12 scans. Addresses feedback on ui-api-deps.json v66 output: wrong schema (path/component/authentication string instead of filePath/routePath/authenticated boolean), canonicalPaths as route map instead of frozen UI paths, missing authRequired, page-level pathParamMap violations. |
| 66 | 2026-02 | **Organisation Endpoint Naming & Parameter Source Clarification (Cross-Agent Alignment Fix):** Fixed two critical misalignments from v65. (1) Updated all examples and rules to use `/api/organisations/me` (plural with /me singleton) instead of `/api/organisation` (singular) to align with Agent 4 organisation endpoint naming enforcement. (2) Added `paramSource` field to Optional API Call Fields schema for UI state parameter sources (selected row, form state, etc.). (3) Clarified `pathParamMap` scope: ONLY for route params that differ in naming, NOT for UI state params. (4) Updated Rule 2 to acknowledge three parameter sources: routePath, dependsOn (API responses), or paramSource (UI state). (5) Strengthened Rule 8 with CRITICAL clarification that pathParamMap only applies to parameters that exist in routePath. (6) Updated UsersPage example to use `paramSource` instead of incorrect `pathParamMap` usage. (7) Added Scan 11 for paramSource validation. (8) Updated Scan 2 to check for dependsOn OR paramSource. (9) Updated Scan 8 to explicitly check only route params and flag misuse of pathParamMap for non-route params. (10) Fixed totalPages: 18 → 19 in example JSON. (11) Updated verification table to 11 scans. Addresses feedback on v65: organisation endpoint drift, pathParamMap misuse conflicting with Rule 2, totalPages inconsistency. |
| 65 | 2026-02 | **Path Parameter Mapping & Role Propagation (Output Quality Fix):** Added 4 new fields and rules to address common output defects. (1) Added pathParamMap field to Optional API Call Fields schema for explicit parameter mapping when route param names differ from API param names (e.g., :projectId → :id). (2) Added requiredRole field to Optional API Call Fields schema for propagating RBAC requirements from service-contracts.json. (3) Added notes field to Optional API Call Fields schema for call-level context. (4) Added Rule 8: Path parameter mapping rule (MUST when params differ) - requires pathParamMap when route and API parameter names differ. (5) Added Rule 9: Role requirement propagation rule (MUST for admin-only calls) - requires requiredRole field when service-contracts endpoint has non-null rbac. (6) Added Rule 10: Platform-level resource clarification rule - prohibits contradictory "organisation-scoped" terminology for platform-level resources. (7) Added Scan 8, 9, 10 to PRE-OUTPUT SELF-VERIFICATION for these rules. (8) Added UsersPage example showing pathParamMap and requiredRole usage. (9) Updated totalPages from 18 → 19 in example. (10) Updated verification table to include 10 scans (was 7). Addresses feedback on ui-api-deps.json output: missing parameter mapping, missing role requirements, contradictory platform-level notes, totalPages mismatch. |
| 64 | 2026-02 | BLOCKER FIXES: Added CRITICAL RECURRING DEFECT warning for three common violations. Fixed example JSON (AcceptInvitePage now correctly shows required:false for deferred scope). Strengthened Rule 2 (dependsOn is MUST, not implicit). Strengthened Rule 4 (deferred pages MUST have required:false on ALL calls). Added inline checkpoint requirement. Updated Scan 2 and Scan 3 with explicit defect language. |
| 63 | 2026-02 | Governance reform: Replaced version-pinned dependencies with file-linked references per Constitution v7.0 Section Y. No structural changes. |
| 62 | 2026-02 | Added rule 6: capability UI coverage (every manage-* capability must have a UI surface). Added rule 7: tenant container UI rule (reads tenantContainer.uiStrategy from scope-manifest). Added Scan 7: capability and tenant container coverage. |
| 61 | 2026-02 | SECTION 5: DEPENDENCY DISCIPLINE RULES (5 rules). Extended schema with optional fields (queryParams, dependsOn, notes). Strengthened deferred page semantics: deferred pages must not mark API calls as required. Added SECTION 6: PRE-OUTPUT SELF-VERIFICATION (6 scans). Added MANDATORY OUTPUT FORMAT and FILE DELIVERY REQUIREMENT. |
| 60 | 2026-02 | Dependency pin: Agent 4 v63 -> v64. |
| 59 | 2026-02 | Dependency pin: Agent 4 v62 -> v63. |
| 58 | 2026-02 | Dependency pin: Agent 4 v61 -> v62 (tenant-scoping middleware, convention enforcement). |
| 57 | 2026-02 | Dependency pin: Agent 4 v60 -> v61. No structural changes. |
| 56 | 2026-02 | Dependency pins: Constitution v6.1 -> v6.2 (file delivery requirement), Agent 4 v59 -> v60 (inline checkpoint, file delivery). |
| 55 | 2026-02 | Dependency pin: Agent 4 v58 -> v59. No structural changes. |
| 54 | 2026-02 | Dependency pin: Agent 4 v57 -> v58. No structural changes. |
| 53 | 2026-02 | Dependency pin: Agent 4 v56 -> v57. No structural changes. |
| 52 | 2026-02 | Dependency pin: Agent 4 v55 -> v56. No structural changes. |
| 51 | 2026-02 | Dependency pin: Agent 4 v54 -> v55. No structural changes. |
| 50 | 2026-02 | Dependency pin: Agent 4 v53 -> v54. No structural changes. |
| 49 | 2026-02 | Dependency pin: Agent 4 v52 -> v53. No structural changes. |
| 48 | 2026-02 | Dependency pin: Agent 4 v51 -> v52. No structural changes. |
| 47 | 2026-02 | Dependency pin: Agent 4 v50 -> v51. No structural changes. |
| 46 | 2026-02 | Dependency pins: Agent 1 v30 -> v31, Agent 4 v49 -> v50. No structural changes. |
| 45 | 2026-02 | Dependency pins: Agent 1 v29 -> v30, Agent 4 v48 -> v49. No structural changes. |
| 44 | 2026-02 | Updated to Agent 1 v29. Agent 5 now additionally reads performanceIntent (avoid real-time UI patterns when noRealTimeGuarantees is true). |
| 43 | 2026-02 | Updated to Agent 1 v28 (scope-manifest v5). Agent 5 now additionally reads productIntent (UX complexity calibration), supportedUseCases (workflow prioritisation), explicitNonGoals (avoid out-of-scope UI), and platformConstraints.configurationModel (ensure UI-accessible config). |
| 42 | 2026-02 | Updated to Agent 1 v26 (scope-manifest v4). Agent 5 now reads userRoles (UI visibility gating), onboarding.firstRunFlow (page sequence), and entityContracts.states (UI state displays) from scope-manifest.json. |
| 41 | 2026-02 | RESTRUCTURE: Dropped 05-UI-SPECIFICATION.md and routes-pages-manifest.json (Constitution Section AL). Single output: ui-api-deps.json with merged routing data. Schema v2 with totalPages and scope field. |
| 40 | 2026-02 | FILE OUTPUT MANIFEST added per Constitution Section AK. |

---

## FILE OUTPUT MANIFEST

**Execution context:** GPT (specification agent). Output to `docs/` only.

| File | Path | Type | Required |
|------|------|------|----------|
| UI-API Dependencies | docs/ui-api-deps.json | Machine artifact | YES |

**IMPORTANT - OUTPUT BOUNDARY:** This agent outputs ONLY the file listed above. The bash script blocks in this document are **specifications for Agent 6 to extract and generate** as `scripts/verify-*.sh` files during the build. This agent MUST NOT create markdown spec files, separate routes-pages files, or script files.

**FILE DELIVERY REQUIREMENT:** Every file listed above MUST be prepared as a downloadable file and presented to the user for download. Do NOT output file contents as inline code blocks in the chat - always create the actual file and offer it for download. If the platform supports file creation (e.g., ChatGPT file output, Claude artifacts), use that mechanism. The user should receive a clickable download link, not a code block they have to manually copy into a file.

---

## ROLE

Transform product and API contract requirements into a single ui-api-deps.json that defines every UI page: its file path, route, scope status, authentication requirements, and API call dependencies.

**MANDATORY OUTPUT FORMAT - YOU MUST FOLLOW THIS SEQUENCE:**

1. Generate ui-api-deps.json content (working draft - do NOT deliver yet).
2. Execute ALL 12 scans from SECTION 6: PRE-OUTPUT SELF-VERIFICATION against the working draft.
3. Output the verification summary table showing counts and pass/fail for each scan.
4. If ANY scan fails, fix the defects in the working draft and re-run that scan.
5. ONLY AFTER all 12 scans pass, deliver the final ui-api-deps.json as a downloadable file.

** CRITICAL RECURRING DEFECT - READ BEFORE GENERATING ANY PAGE:**

The following three defects have recurred across multiple audit rounds. They MUST NOT appear in your output:

1. **Deferred pages with `required: true` API calls:** ANY page with `scope: "deferred"` MUST have ALL its API calls set to `required: false`. There are ZERO exceptions. Deferred endpoints don't exist in the MVP backend - marking them required creates false contracts that fail smoke tests. If you need to document which calls would be required when enabled, use the page-level `notes` field.

2. **Missing `dependsOn` or `paramSource` for non-route parameters:** ANY API call whose path contains a dynamic parameter (e.g., `:userId`) that is NOT in the page's `routePath` MUST include either a `dependsOn` field (if parameter comes from another API response) OR a `paramSource` field (if parameter comes from UI state like selected row). Example: SettingsPage (`/settings`) calling `PATCH /api/users/:userId` MUST have `"dependsOn": "/api/auth/me"` because userId comes from the auth response, not the URL. UsersPage (`/admin/users`) calling `DELETE /api/users/:id` MUST have `"paramSource": {"id": "selected row in users table"}` because id comes from user selection, not the URL.

3. **Capability without UI surface:** Every `manage-*` capability in the scope-manifest's `userRoles` MUST have a corresponding UI page (or documented section within a page) that exercises it. If the scope-manifest declares `manage-organisation` but no page includes organisation GET/PATCH endpoints, it is a defect. For capabilities served by a section within another page (e.g., Settings), include a `notes` field documenting the mapping.

Apply the inline checkpoint below to EVERY page before adding it to the output.

**INLINE CHECKPOINT (per page):**
Before adding each page to the pages array, verify:
- [ ] If `scope: "deferred"` -> ALL apiCalls have `required: false`
- [ ] For each apiCall with a path param not in routePath -> `dependsOn` OR `paramSource` is present
- [ ] If page exercises a `manage-*` capability -> `notes` field documents this (unless obvious from page name)

Failure to comply with these checks has been the most common defect category in this framework's history.

**PRIMARY INPUTS:**
- `docs/scope-manifest.json` (from Agent 1): Read `userRoles` for UI visibility and permission gating, `onboarding.firstRunFlow` for first-run page sequence design, `entityContracts[].states` for UI state displays (badges, filters, status indicators), `deferralDeclarations.*.ui.pages` for deferred page scope, `productIntent` to calibrate UX complexity to target user profile, `supportedUseCases` to prioritise which workflows and page designs matter most, `explicitNonGoals` to avoid building UI for out-of-scope features, `platformConstraints.configurationModel` to ensure all configuration is UI-accessible when approach is "ui-driven", `performanceIntent` (if present) to avoid real-time UI patterns when `noRealTimeGuarantees` is true, `platformConstraints.multiTenancy.tenantContainer` for tenant UI strategy
- `docs/service-contracts.json` (from Agent 4): Read endpoints for API call dependencies per page

---

## FORBIDDEN PATTERNS (BLOCKING SCHEMA VIOLATIONS)

**CRITICAL:** The following patterns are BLOCKING SCHEMA VIOLATIONS that will break Agent 6 implementation and verification scripts. If ANY appear in your output, the entire file is invalid and MUST be rejected.

**1. WRONG PAGE SCHEMA - Using legacy v1 fields:**
```json
// ❌ WRONG - v1 schema (INVALID)
{
  "path": "/login",              // Wrong field name
  "component": "LoginPage.tsx",  // Wrong field name
  "authentication": "public"     // Wrong field type (string)
}

// ✅ CORRECT - v2 schema (REQUIRED)
{
  "filePath": "client/src/pages/LoginPage.tsx",
  "routePath": "/login",
  "scope": "required",
  "authenticated": false         // Boolean, not string
}
```

**2. WRONG CANONICAL PATHS - Using route map instead of frozen UI paths:**
```json
// ❌ WRONG - Route alias map (INVALID)
{
  "canonicalPaths": {
    "/login": "client/src/pages/LoginPage.tsx",
    "/dashboard": "client/src/pages/DashboardPage.tsx",
    "/users": "client/src/pages/UsersPage.tsx"
  }
}

// ✅ CORRECT - Frozen UI file paths (REQUIRED)
{
  "canonicalPaths": {
    "apiClient": "client/src/lib/api.ts",
    "errorBoundary": "client/src/lib/ErrorBoundary.tsx",
    "appComponent": "client/src/App.tsx"
  }
}
```

**CRITICAL:** `canonicalPaths` MUST have exactly these 3 keys and NO OTHER KEYS:
- `apiClient` - Path to centralized API client (e.g., axios/fetch wrapper)
- `errorBoundary` - Path to React error boundary component
- `appComponent` - Path to root App component

If you need route aliases, create a separate top-level field (e.g., `routeAliases`), but `canonicalPaths` is ONLY for these 3 frozen UI infrastructure files.

**3. MISSING authRequired ON API CALLS:**
```json
// ❌ WRONG - Missing authRequired (INVALID)
{
  "method": "GET",
  "path": "/api/projects",
  "required": true
  // authRequired missing!
}

// ✅ CORRECT - authRequired present (REQUIRED)
{
  "method": "GET",
  "path": "/api/projects",
  "required": true,
  "authRequired": true
}
```

**4. pathParamMap AT PAGE LEVEL (NOT API CALL LEVEL):**
```json
// ❌ WRONG - pathParamMap on page object (INVALID)
{
  "filePath": "client/src/pages/ProjectPage.tsx",
  "routePath": "/projects/:projectId",
  "pathParamMap": {"projectId": "id"},  // WRONG LOCATION
  "apiCalls": [...]
}

// ✅ CORRECT - pathParamMap on API call (REQUIRED)
{
  "filePath": "client/src/pages/ProjectPage.tsx",
  "routePath": "/projects/:projectId",
  "apiCalls": [
    {
      "method": "GET",
      "path": "/api/projects/:id",
      "pathParamMap": {"projectId": "id"}  // CORRECT LOCATION
    }
  ]
}
```

**5. DUPLICATE ROUTE FIELDS (path AND routePath):**
```json
// ❌ WRONG - Both path and routePath (INVALID)
{
  "path": "/projects/:id",       // Wrong field
  "routePath": "/projects/:projectId",
  "filePath": "..."
}

// ✅ CORRECT - Only routePath (REQUIRED)
{
  "routePath": "/projects/:projectId",
  "filePath": "client/src/pages/ProjectPage.tsx"
}
```

**6. paramSource WRONG TYPE - Using string instead of object:**
```json
// ❌ WRONG - paramSource as string (INVALID)
{
  "method": "GET",
  "path": "/api/users/:id",
  "paramSource": "selectedUser"  // WRONG TYPE - string not object
}

// ❌ WRONG - paramSource without parameter key (INVALID)
{
  "method": "GET",
  "path": "/api/users/:id",
  "paramSource": {"source": "selected row"}  // WRONG KEY - doesn't name the param
}

// ✅ CORRECT - paramSource as object keyed by parameter name (REQUIRED)
{
  "method": "GET",
  "path": "/api/users/:id",
  "paramSource": {"id": "selected user row"}  // CORRECT - object with param key
}

// ✅ CORRECT - Multiple parameters (REQUIRED)
{
  "method": "GET",
  "path": "/api/projects/:projectId/datasets/:id",
  "paramSource": {
    "id": "selected dataset row"
  }
  // projectId comes from route, only :id needs paramSource
}
```

**CRITICAL:** paramSource MUST be an object (not a string) where each key is the EXACT parameter name from the path (e.g., `id`, `userId`, `datasetId`) and the value describes the UI source. This creates machine-enforceable parameter sourcing that downstream tools can parse.

**If you see ANY of these 6 patterns in your draft ui-api-deps.json:**
1. STOP immediately
2. Review Section 1: UI-API Dependencies Schema v2
3. Fix ALL violations
4. Re-run Scan 11 (for paramSource) and Scan 12 (for schema)
5. Do NOT deliver until both scans pass

---

## SECTION 1: UI-API DEPENDENCIES SCHEMA (v2 - CONSOLIDATED)

**File:** `docs/ui-api-deps.json`

```json
{
 "$schema": "ui-api-deps-v2",
 "totalPages": 19,
 "canonicalPaths": {
 "apiClient": "client/src/lib/api.ts",
 "errorBoundary": "client/src/lib/ErrorBoundary.tsx",
 "appComponent": "client/src/App.tsx"
 },
 "pages": [
 {
 "filePath": "client/src/pages/LoginPage.tsx",
 "routePath": "/login",
 "scope": "required",
 "authenticated": false,
 "apiCalls": [
 {
 "method": "POST",
 "path": "/api/auth/login",
 "required": true,
 "authRequired": false
 }
 ]
 },
 {
 "filePath": "client/src/pages/SettingsPage.tsx",
 "routePath": "/settings",
 "scope": "required",
 "authenticated": true,
 "notes": "manage-organisation capability served here via GET/PATCH /api/organisations/me. User profile update uses userId from /api/auth/me response.",
 "apiCalls": [
 {
 "method": "GET",
 "path": "/api/auth/me",
 "required": true,
 "authRequired": true
 },
 {
 "method": "PATCH",
 "path": "/api/users/:userId",
 "required": true,
 "authRequired": true,
 "dependsOn": "/api/auth/me",
 "notes": "userId parameter sourced from auth response"
 },
 {
 "method": "GET",
 "path": "/api/organisations/me",
 "required": true,
 "authRequired": true
 },
 {
 "method": "PATCH",
 "path": "/api/organisations/me",
 "required": true,
 "authRequired": true
 }
 ]
 },
 {
 "filePath": "client/src/pages/AcceptInvitePage.tsx",
 "routePath": "/accept-invite/:token",
 "scope": "deferred",
 "authenticated": false,
 "notes": "When invite feature enabled, GET becomes required.",
 "apiCalls": [
 {
 "method": "GET",
 "path": "/api/invitations/:token",
 "required": false,
 "authRequired": false
 }
 ]
 },
 {
 "filePath": "client/src/pages/UsersPage.tsx",
 "routePath": "/admin/users",
 "scope": "required",
 "authenticated": true,
 "notes": "Admin-only user management page. Demonstrates paramSource for UI state params and requiredRole for RBAC.",
 "apiCalls": [
 {
 "method": "GET",
 "path": "/api/users",
 "required": true,
 "authRequired": true,
 "requiredRole": "admin",
 "queryParams": ["role", "status"]
 },
 {
 "method": "GET",
 "path": "/api/users/:id",
 "required": true,
 "authRequired": true,
 "requiredRole": "admin",
 "paramSource": {"id": "selected row in users table"},
 "notes": "Admin-only user detail retrieval"
 },
 {
 "method": "POST",
 "path": "/api/users",
 "required": true,
 "authRequired": true,
 "requiredRole": "admin",
 "notes": "Admin-only user creation"
 },
 {
 "method": "PATCH",
 "path": "/api/users/:id",
 "required": true,
 "authRequired": true,
 "requiredRole": "admin",
 "paramSource": {"id": "selected row in users table"},
 "notes": "User selection from table provides id parameter"
 },
 {
 "method": "DELETE",
 "path": "/api/users/:id",
 "required": true,
 "authRequired": true,
 "requiredRole": "admin",
 "paramSource": {"id": "selected row in users table"}
 }
 ]
 }
 ]
}
```

**NOTE:** The AcceptInvitePage example demonstrates correct deferred page handling: `scope: "deferred"` with `required: false` on all API calls. The SettingsPage example demonstrates correct `dependsOn` usage and capability documentation via `notes`. The UsersPage example demonstrates `paramSource` (for UI state parameters sourced from selected rows), `requiredRole` (for admin-only operations including GET /api/users/:id for detail view), and `queryParams` (for filter UI exposure).

### Mandatory Top-Level Fields

**CRITICAL:** These fields are REQUIRED in ui-api-deps.json v2 schema. See FORBIDDEN PATTERNS for what NOT to do.

- **$schema** (string): Must be exactly `"ui-api-deps-v2"` (not v1, not other values)
- **totalPages** (integer): Total count of pages (must equal pages array length - verified by Scan 5)
- **canonicalPaths** (object): Frozen frontend file paths with exactly 3 keys: `apiClient`, `errorBoundary`, `appComponent`. **NOT a route-to-component map** (see FORBIDDEN PATTERNS #2).
- **pages** (array): All UI pages with their specifications (using v2 page schema)

### Mandatory Page Fields

**CRITICAL:** v2 schema uses these fields. Do NOT use legacy v1 fields like `path`, `component`, or `authentication` (string) - see FORBIDDEN PATTERNS #1 and #5.

- **filePath** (string): Repo-relative path to page component (e.g., `"client/src/pages/LoginPage.tsx"`). **NOT `component`**.
- **routePath** (string): URL route path (e.g., `"/login"`). **NOT `path`**. This is the ONLY route field - do not include both `path` and `routePath`.
- **scope** (string): Must be exactly `"required"` or `"deferred"` (no other values)
- **authenticated** (boolean): Whether page requires authentication. **MUST be boolean** (`true`/`false`), NOT string (`"public"`/`"required"`).
- **apiCalls** (array): API endpoints this page calls (using v2 API call schema with mandatory `authRequired` field)
- **notes** (string, optional): Page-level context for implementation agents. MUST be included when: (a) page exercises a capability not obvious from page name, (b) page serves tenant container UI per settingsEmbedded strategy, or (c) deferred page needs to document which calls would be required when enabled.
- **FORBIDDEN at page level:** `pathParamMap` (see FORBIDDEN PATTERNS #4 - this belongs on API calls, not pages)

### Mandatory API Call Fields

- **method** (string): HTTP method
- **path** (string): API endpoint path (must match a path in service-contracts.json)
- **required** (boolean): Whether this call is essential for page functionality. **For deferred-scope pages, this MUST be `false` on ALL calls** - see Rule 4.
- **authRequired** (boolean): Whether the API call requires authentication. **This field is MANDATORY on every API call.** Missing `authRequired` is a schema violation (see FORBIDDEN PATTERNS #3).

### Optional API Call Fields

- **queryParams** (array of strings, optional): Meaningful query parameters the endpoint accepts that affect UI behaviour (e.g., `["datasetType", "status"]`). Include when the endpoint supports filtering, sorting, or pagination parameters that the UI should expose. Omit for endpoints with no meaningful query parameters.
- **dependsOn** (string, optional): Path of another API call on the same page whose response provides a dynamic parameter for this call. **MUST be included** when a path parameter (e.g., `:userId`) is not sourced from the URL route but from another API call's response. Example: `"/api/auth/me"` when userId comes from the auth response. Omit when all dynamic parameters come from route params or UI state.
- **pathParamMap** (object, optional): Explicit mapping from page route parameters to API path parameters when they differ. **MUST be included** when the page's routePath parameter name differs from the API path parameter name. **Only applies to parameters that exist in routePath.** Example: `{"projectId": "id"}` maps page route param `:projectId` to API path param `:id`. Do not use this for parameters sourced from UI state - use `paramSource` instead.
- **paramSource** (object, optional): **MUST be an object (not a string)** where each key is the exact parameter name from the API path. Documents parameters sourced from UI state rather than route or API responses. **MUST be included** when a path parameter comes from UI interaction (e.g., selected table row, form state, local storage). Example: `{"id": "selected row in users table"}` for `/api/users/:id` indicates the `:id` parameter comes from user selection, not URL. The object key (`id`) must match the parameter name exactly. **WRONG:** `"paramSource": "selectedUser"` (string type). **CORRECT:** `"paramSource": {"id": "selected user row"}` (object type). See FORBIDDEN PATTERNS #6.
- **requiredRole** (string, optional): RBAC role required to call this endpoint. **MUST be included** when the corresponding service-contracts.json endpoint has `rbac` field set to a non-null value. Valid values: "admin", "member", or other role names from scope-manifest userRoles. Omit only when the endpoint is accessible to all authenticated users (rbac: null in service-contracts).
- **notes** (string, optional): Call-level context explaining non-obvious behaviours, platform-level resource usage, or conditional requirements.

---

## SECTION 2: CANONICAL UI PATHS (FROZEN)

The canonicalPaths object defines immutable frontend file locations. These prevent the api.ts drift pattern.

```json
{
 "canonicalPaths": {
 "apiClient": "client/src/lib/api.ts",
 "errorBoundary": "client/src/lib/ErrorBoundary.tsx",
 "appComponent": "client/src/App.tsx"
 }
}
```

### Verification Gate (Tightened Detection)

```bash
#!/bin/bash
# scripts/verify-ui-canonical-paths.sh
set -euo pipefail

echo "=== Verifying Canonical UI Paths ==="

if [ ! -f "docs/ui-api-deps.json" ]; then
 echo "[X] FAIL: ui-api-deps.json missing"
 exit 1
fi

FAILURES=0

# Check each canonical path exists
while read -r entry; do
 KEY=$(echo "$entry" | jq -r '.key')
 FILEPATH=$(echo "$entry" | jq -r '.value')

 if [ ! -f "$FILEPATH" ]; then
 echo "[X] FAIL: Canonical path missing: $KEY = $FILEPATH"
 FAILURES=$((FAILURES + 1))
 else
 echo "[OK] $KEY: $FILEPATH"
 fi
done < <(jq -c '.canonicalPaths | to_entries[]' docs/ui-api-deps.json)

# Check for known drift variants
FORBIDDEN_VARIANTS=(
 "client/src/lib/api-client.ts"
 "client/src/lib/apiClient.ts"
 "client/src/lib/api_client.ts"
 "client/src/lib/axios.ts"
 "client/src/lib/http-client.ts"
 "client/src/lib/httpClient.ts"
)

for variant in "${FORBIDDEN_VARIANTS[@]}"; do
 if [ -f "$variant" ]; then
 echo "[X] FAIL: Drift variant detected: $variant"
 FAILURES=$((FAILURES + 1))
 fi
done

if [ $FAILURES -gt 0 ]; then
 echo "[X] CANONICAL PATH CHECK FAILED: $FAILURES issues"
 exit 1
fi

echo "[OK] All canonical UI paths verified"
exit 0
```

---

## SECTION 3: SELF-CONSISTENCY VERIFICATION

```bash
#!/bin/bash
# scripts/verify-ui-self-consistency.sh
set -euo pipefail

echo "=== Verifying UI-API-Deps Self-Consistency ==="

if [ ! -f "docs/ui-api-deps.json" ]; then
 echo "[X] FAIL: ui-api-deps.json missing"
 exit 1
fi

jq empty docs/ui-api-deps.json || { echo "[X] FAIL: Invalid JSON"; exit 1; }

FAILURES=0

# totalPages must equal pages array length
TOTAL=$(jq -r '.totalPages' docs/ui-api-deps.json)
ACTUAL=$(jq -r '.pages | length' docs/ui-api-deps.json)

if [ "$TOTAL" != "$ACTUAL" ]; then
 echo "[X] FAIL: totalPages=$TOTAL but pages.length=$ACTUAL"
 FAILURES=$((FAILURES + 1))
fi

# Every page must have valid scope
while read -r page; do
 FILE_PATH=$(echo "$page" | jq -r '.filePath')
 SCOPE=$(echo "$page" | jq -r '.scope')

 if [ "$SCOPE" != "required" ] && [ "$SCOPE" != "deferred" ]; then
 echo "[X] FAIL: $FILE_PATH has invalid scope: $SCOPE"
 FAILURES=$((FAILURES + 1))
 fi
done < <(jq -c '.pages[]' docs/ui-api-deps.json)

# Deferred pages must have all API calls with required: false
while read -r page; do
 FILE_PATH=$(echo "$page" | jq -r '.filePath')
 REQUIRED_TRUE_COUNT=$(echo "$page" | jq '[.apiCalls[] | select(.required == true)] | length')

 if [ "$REQUIRED_TRUE_COUNT" -gt 0 ]; then
 echo "[X] FAIL: Deferred page $FILE_PATH has $REQUIRED_TRUE_COUNT API calls with required:true (must be 0)"
 FAILURES=$((FAILURES + 1))
 fi
done < <(jq -c '.pages[] | select(.scope == "deferred")' docs/ui-api-deps.json)

if [ $FAILURES -gt 0 ]; then
 echo "[X] SELF-CONSISTENCY FAILED: $FAILURES issues"
 exit 1
fi

echo "[OK] UI-API dependencies self-consistent"
exit 0
```

---

## SECTION 4: DEFERRED PAGES VERIFICATION

```bash
#!/bin/bash
# scripts/verify-no-deferred-pages.sh
set -euo pipefail

echo "=== Verifying No Deferred Pages Exist ==="

if [ ! -f "docs/ui-api-deps.json" ]; then
 echo "[X] FAIL: ui-api-deps.json missing"
 exit 1
fi

VIOLATIONS=0

while read -r page; do
 ROUTE_PATH=$(echo "$page" | jq -r '.routePath')
 PAGE_FILE=$(echo "$page" | jq -r '.filePath')

 if [ -f "$PAGE_FILE" ]; then
 echo "[X] FAIL: Deferred page exists: $PAGE_FILE"
 VIOLATIONS=$((VIOLATIONS + 1))
 fi

 if grep -q "$ROUTE_PATH" client/src/App.tsx 2>/dev/null; then
 echo "[X] FAIL: Deferred route in App.tsx: $ROUTE_PATH"
 VIOLATIONS=$((VIOLATIONS + 1))
 fi
done < <(jq -c '.pages[] | select(.scope == "deferred")' docs/ui-api-deps.json)

if [ $VIOLATIONS -gt 0 ]; then
 echo "[X] DEFERRALS INCOMPLETE: $VIOLATIONS violations found"
 exit 1
fi

echo "[OK] No deferred pages exist (correctly omitted)"
exit 0
```

---

## SECTION 5: DEPENDENCY DISCIPLINE RULES

These rules prevent common UI-API misalignment defects that cause runtime 404s, "page loads but nothing happens" bugs, and specification drift between Agent 4 and Agent 5 outputs.

**1. Route-API scope alignment rule:** When a page's `routePath` contains a scoping parameter (e.g., `:projectId`, `:organisationId`), every `required: true` API call on that page must either: (a) include the same scoping parameter in its path (e.g., `/api/projects/:projectId/data-sources`), or (b) have a page-level `notes` field explaining why the API call is intentionally broader than the page scope (e.g., "Lists all org-wide sources; UI filters client-side by project context"). A project-scoped page route calling an org-wide API endpoint without explanation creates a silent data leak where the page displays more data than its URL context implies.

**2. Parameter sourcing rule (MUST - not optional):** When an API call's `path` contains a dynamic parameter (e.g., `:userId`, `:schemaId`) that is NOT present in the page's `routePath`, the API call MUST explicitly document where that parameter comes from using ONE of these fields:
- **dependsOn** (string): When the parameter comes from another API call's response on the same page. Example: `"dependsOn": "/api/auth/me"` when userId comes from the auth response.
- **paramSource** (object): When the parameter comes from UI state (selected row, form input, local storage, etc.). Example: `"paramSource": {"id": "selected row in users table"}`.

There are ZERO exceptions. Every non-route parameter MUST have either `dependsOn` OR `paramSource`. This creates a traceable dependency chain so implementation agents know where to source dynamic values rather than hardcoding them or using stale route params.

**Example violation:** SettingsPage (`routePath: "/settings"`) has `PATCH /api/users/:userId` without `dependsOn` or `paramSource`. This is a defect.

**Example compliance - API response source:** SettingsPage has `PATCH /api/users/:userId` with `"dependsOn": "/api/auth/me"` because userId comes from the auth response.

**Example compliance - UI state source:** UsersPage (`routePath: "/admin/users"`) has `DELETE /api/users/:id` with `"paramSource": {"id": "selected row in users table"}` because id comes from user selection.

**3. Query parameter documentation rule:** When a service-contracts.json endpoint declares meaningful query parameters (e.g., filtering by type, status, date range, or pagination params), and the UI page is expected to expose those filters, the API call entry SHOULD include a `queryParams` array listing the parameters the UI will use. This prevents implementation agents from missing filter/sort/pagination capabilities that the backend supports. Omit `queryParams` only when the endpoint has no meaningful query parameters or the UI intentionally ignores them.

**4. Deferred scope required-call rule (MUST - hard constraint):** On pages with `scope: "deferred"`, ALL API calls MUST have `required: false`. There are ZERO exceptions. Deferred pages reference endpoints that are excluded from route registration in the MVP backend (per Agent 4's `deferredRouteHandling: "excludeFromRegistration"`). Marking deferred API calls as `required: true` creates a false contract - any smoke test or runtime check that navigates to the page will encounter 404s for endpoints that don't exist yet.

**Example violation:** AcceptInvitePage with `scope: "deferred"` and an API call with `required: true`. This is a defect.

**Example compliance:** AcceptInvitePage with `scope: "deferred"` and ALL API calls having `required: false`, with a page-level `notes` field explaining "When invite feature enabled, GET becomes required."

**5. Cross-document endpoint coverage rule:** Every API `path` referenced in ui-api-deps.json MUST exist in service-contracts.json (either as a required or deferred endpoint). A UI dependency referencing an endpoint not present in the service contracts creates an unresolvable contract - Agent 6 cannot implement a route that was never specified. **Before finalizing:** extract all unique API paths from ui-api-deps.json and verify each one appears in service-contracts.json. Any orphaned path is a defect. This check is bidirectional: also flag any required endpoint in service-contracts.json that is user-facing (not internal/webhook) but has no UI page referencing it - this may indicate a missing page.

**6. Capability UI coverage rule (MUST - hard constraint):** Every `manage-*` capability declared in `userRoles` in the scope manifest MUST have at least one UI page (or a section within a page) that exercises it. Extract all `manage-*` capabilities, then verify each one maps to at least one page in ui-api-deps.json that includes API calls enabling that capability. If a capability has no corresponding UI surface, it is either a missing page or the capability declaration in the scope manifest is aspirational rather than implemented - either way, flag it.

**For capabilities served by a section within another page** (e.g., "manage-organisation" served by SettingsPage), the page MUST include a `notes` field documenting the mapping. Example: `"notes": "manage-organisation capability served here via GET/PATCH /api/organisations/me"`.

**Example violation:** Scope-manifest declares `manage-organisation` capability, but SettingsPage only includes `/api/auth/me` and `/api/users/:userId` - no organisation endpoints. This is a defect.

**Example compliance:** SettingsPage includes `GET /api/organisations/me` and `PATCH /api/organisations/me` with a `notes` field documenting the capability mapping.

**7. Tenant container UI rule:** Read `platformConstraints.multiTenancy.tenantContainer` from the scope manifest. Based on `uiStrategy`, enforce minimum UI requirements:
- `"none"`: No UI surface required for the tenant container entity.
- `"settingsEmbedded"`: The Settings page (or equivalent) MUST include API calls for the tenant entity (at minimum GET and PATCH). The page MUST include a `notes` field documenting that tenant management is embedded here.
- `"dedicatedPage"`: A standalone page must exist in ui-api-deps.json for the tenant entity with full CRUD API calls.
If the required minimum UI surface is missing for the declared strategy, it is a defect. This rule prevents the tenant container from being declared in the scope manifest but silently omitted from the UI specification.

**8. Path parameter mapping rule (MUST when params differ):** When a page uses different parameter names in its `routePath` than the API endpoint uses in its path, the API call MUST include a `pathParamMap` object providing explicit mapping. **CRITICAL:** This rule applies ONLY to parameters that exist in the routePath. Example: if page route is `/projects/:projectId/edit` but API path is `/api/projects/:id/data-sources`, the API call MUST include `"pathParamMap": {"projectId": "id"}`. This creates deterministic parameter mapping for downstream codegen and QA scripts. Text-only notes like "maps to :id" are not machine-enforceable and are insufficient. **Do not use pathParamMap for parameters sourced from UI state** - use `paramSource` instead (see Rule 2).

**9. Role requirement propagation rule (MUST for admin-only calls):** When an API call references an endpoint from service-contracts.json that has a non-null `rbac` field (e.g., `"rbac": "admin"`), the corresponding API call in ui-api-deps.json MUST include a `requiredRole` field with the same value. This ensures the UI dependency contract reflects role requirements so downstream implementation correctly shows/hides admin-only UI elements and handles authorization failures appropriately. Omitting `requiredRole` on admin-only calls creates UI that shows buttons to all users and only fails at runtime. **CRITICAL:** Check ALL endpoints in a page - if a page has 5 admin-only endpoints, ALL 5 must have `requiredRole: "admin"`, not just 4 of them.

**10. Platform-level resource clarification rule:** When an API call references a platform-level resource (identified by `tenantKey: "none"` in data-relationships.json), do NOT describe it as "organisation-scoped" in notes or comments. Platform-level resources are explicitly NOT organisation-scoped - they are shared across the entire platform. Use accurate terminology: "platform-level resource", "shared resource", or "tenant-agnostic resource". Contradictory notes confuse implementation agents.

---

## SECTION 6: PRE-OUTPUT SELF-VERIFICATION

Before delivering ui-api-deps.json, execute all scans below against the working draft. Report results in the verification summary table.

### Scan 1: Route-API scope alignment (Rule 1)
1. For each page with a scoping parameter in `routePath` (e.g., `:projectId`), check every `required: true` API call.
2. If the API call path does not contain the same scoping parameter, verify a `notes` field explains the intentional mismatch.
3. **Report:** "X scoped pages verified, all API calls aligned or explained."

### Scan 2: Parameter sourcing completeness (Rule 2) - DEFECT IF MISSING
1. For each API call, extract dynamic parameters from `path` (e.g., `:userId`, `:schemaId`).
2. Check if each parameter exists in the page's `routePath`.
3. If the parameter is NOT in the routePath, verify the API call has either `dependsOn` OR `paramSource` field.
4. If the parameter is NOT in routePath AND both `dependsOn` and `paramSource` are missing, **this is a DEFECT**.
5. **Report:** "X API calls with non-route params verified, all have dependsOn or paramSource." OR "DEFECT: X API calls missing dependsOn/paramSource for non-route params."

### Scan 3: Deferred scope required-call check (Rule 4) - DEFECT IF VIOLATED
1. For each page with `scope: "deferred"`, check all API calls.
2. If ANY call has `required: true`, **this is a DEFECT**.
3. **Report:** "X deferred pages verified, zero required API calls." OR "DEFECT: X deferred pages have required:true API calls."

### Scan 4: Cross-document endpoint coverage (Rule 5)
1. Extract all unique API paths from ui-api-deps.json.
2. Cross-reference against service-contracts.json endpoints.
3. Flag any path not found in service-contracts.json.
4. **Report:** "X unique API paths verified, all present in service-contracts.json."

### Scan 5: Self-consistency (existing)
1. Verify `totalPages` equals `pages` array length.
2. Verify all pages have valid `scope` values.
3. **Report:** "totalPages matches, all scopes valid."

### Scan 6: Deferred pages not in build (existing)
1. Verify deferred pages are not registered in App.tsx or present as files.
2. **Report:** "X deferred pages verified, none in build."

### Scan 7: Capability and tenant container coverage (Rules 6 + 7) - DEFECT IF MISSING
1. Extract all `manage-*` capabilities from scope-manifest.json `userRoles`.
2. For each capability, verify at least one page in ui-api-deps.json includes API calls that exercise it. If served by a section within another page, verify a `notes` field documents the mapping.
3. Read `tenantContainer.uiStrategy` from scope-manifest.json.
4. If `settingsEmbedded`: verify Settings page includes tenant entity API calls and has a notes field.
5. If `dedicatedPage`: verify a standalone tenant entity page exists.
6. **Report:** "X capabilities verified, all have UI surfaces. Tenant container: [strategy], UI present." OR "DEFECT: X capabilities missing UI surface."

### Scan 8: Path parameter mapping (Rule 8) - DEFECT IF MISSING
1. For each API call, extract dynamic parameters from page `routePath`.
2. For route params only, check if the parameter name in routePath differs from the parameter name in API `path`.
3. If parameter names differ (e.g., routePath has `:projectId`, API path has `:id`) and `pathParamMap` is missing, **this is a DEFECT**.
4. If `pathParamMap` is present but references parameters NOT in routePath, **this is a DEFECT** (pathParamMap is for route params only).
5. **Report:** "X API calls with differing route params verified, all have pathParamMap." OR "DEFECT: X API calls missing pathParamMap for differing route params."

### Scan 9: Role requirement propagation (Rule 9) - DEFECT IF MISSING
1. For each API call in ui-api-deps.json, look up the corresponding endpoint in service-contracts.json.
2. If the endpoint has `rbac` field with non-null value, verify the API call includes `requiredRole` field with the same value.
3. If `rbac` is non-null and `requiredRole` is missing, **this is a DEFECT**.
4. **Report:** "X admin-only API calls verified, all have requiredRole." OR "DEFECT: X admin-only calls missing requiredRole."

### Scan 10: Platform-level resource terminology (Rule 10) - DEFECT IF CONTRADICTORY
1. For each API call with `notes` field, check if it references a platform-level resource.
2. Cross-reference API path entity with data-relationships.json to determine tenantKey.
3. If tenantKey is "none" (platform-level) and notes contain "organisation-scoped", **this is a DEFECT**.
4. **Report:** "X platform-level resources verified, terminology accurate." OR "DEFECT: X notes contain contradictory 'organisation-scoped' for platform resources."

### Scan 11: Parameter source validation (Rule 2 extension) - DEFECT IF MISSING
1. For each API call with `paramSource` field, verify it is an OBJECT (not a string). If paramSource is a string, **this is a DEFECT** (see FORBIDDEN PATTERNS #6).
2. For each API call with `paramSource` object, extract dynamic parameters from the API `path` (e.g., `:id`, `:userId`).
3. Verify that each non-route parameter has a corresponding key in the `paramSource` object. If a path has `:id` but paramSource is `{"source": "..."}` (wrong key), **this is a DEFECT**.
4. Verify the paramSource values are meaningful (not empty, not placeholder text like "TODO" or "selected").
5. For each API call with non-route params, verify exactly ONE of `dependsOn`, `paramSource`, or route param exists.
6. If an API call has BOTH `dependsOn` AND `paramSource` for the same parameter, **this is a DEFECT** (contradictory sources).
7. **Report:** "X UI state params verified, all are objects with valid parameter keys." OR "DEFECT: X paramSource entries are strings/invalid/contradictory (see FORBIDDEN PATTERNS #6)."

### Scan 12: Schema validation (v2 schema compliance) - DEFECT IF ANY VIOLATION
1. Verify `$schema` is exactly `"ui-api-deps-v2"`.
2. Verify `canonicalPaths` exists and contains EXACTLY 3 keys: `apiClient`, `errorBoundary`, `appComponent`. If canonicalPaths has different keys (like route paths `/login`, `/dashboard`) or different count, **this is a DEFECT** (see FORBIDDEN PATTERNS #2).
3. For each page, verify required fields present: `filePath`, `routePath`, `scope`, `authenticated` (boolean).
4. For each page, verify FORBIDDEN fields absent: `path`, `component`, `authentication` (string), page-level `pathParamMap`.
5. For each API call, verify `authRequired` field is present (boolean).
6. **Report:** "Schema v2 compliant: canonicalPaths has exactly 3 keys (apiClient/errorBoundary/appComponent), all page/call fields valid." OR "DEFECT: X schema violations (canonicalPaths wrong keys, missing fields, or forbidden fields present - see FORBIDDEN PATTERNS)."

### Required verification output format

Produce this table in your response BEFORE delivering ui-api-deps.json:

```
| Scan | Rule(s) | Result | Count |
|------|---------|--------|-------|
| Route-API scope alignment | 1 | PASS/FAIL | X scoped pages |
| Parameter sourcing | 2 | PASS/FAIL | X non-route params, all have dependsOn or paramSource |
| Deferred required-call | 4 | PASS/FAIL | X deferred pages, zero required calls |
| Endpoint coverage | 5 | PASS/FAIL | X unique paths |
| Self-consistency | - | PASS/FAIL | totalPages matches |
| Deferred build check | - | PASS/FAIL | X deferred pages |
| Capability + tenant coverage | 6 + 7 | PASS/FAIL | X capabilities, tenant: [strategy] |
| Path parameter mapping | 8 | PASS/FAIL | X route params with differing names, all have pathParamMap |
| Role requirement propagation | 9 | PASS/FAIL | X admin calls, all have requiredRole |
| Platform-level terminology | 10 | PASS/FAIL | X platform resources, terminology accurate |
| Parameter source validation | 2 (ext) | PASS/FAIL | X UI state params, all are objects with parameter keys |
| Schema validation | v2 | PASS/FAIL | canonicalPaths has exactly 3 keys, schema compliant |
```

**The verification summary table is a REQUIRED part of your response.** If the user receives ui-api-deps.json without seeing the verification table above it, the output is incomplete and must be rejected.

---

## VERIFICATION COMMANDS

```bash
bash scripts/verify-ui-canonical-paths.sh
bash scripts/verify-ui-api-alignment.sh
bash scripts/verify-ui-self-consistency.sh
bash scripts/verify-no-deferred-pages.sh
```

---

## DOWNSTREAM HANDOFF

**To Agent 6 (Implementation):**
- Run all 4 verification gates (Phase 4, BLOCKING)
- Use pages array for component generation
- Use canonicalPaths for frozen file locations
- Use apiCalls for API integration per page
- Use dependsOn to wire parameter sourcing from API responses (e.g., userId from /api/auth/me)
- Use paramSource to wire UI-state parameter sourcing (selected row, form state) for non-route params

---

## PROMPT HYGIENE GATE

- [OK] Version Reference block present (Section Y compliant)
- [OK] No dependency version pins outside Version Reference and VERSION HISTORY (Section Y compliant)
- [OK] Single output: ui-api-deps.json only (Section AL compliant)
- [OK] routes-pages-manifest data merged into ui-api-deps.json
- [OK] Schema version updated to v2
- [OK] Deferred pages read from ui-api-deps.json scope field (not scope-manifest)
- [OK] Canonical paths defined in JSON (not hardcoded in gate scripts)
- [OK] All gates use set -euo pipefail and process substitution
- [OK] Route-API scope alignment: scoped pages' required API calls match route scope or have notes
- [OK] Parameter sourcing: non-route dynamic params MUST have dependsOn OR paramSource field
- [OK] Deferred required-call: deferred pages MUST have required:false on ALL API calls
- [OK] Cross-document endpoint coverage: all UI API paths exist in service-contracts.json
- [OK] Capability UI coverage: every manage-* capability MUST have a UI surface with documented mapping
- [OK] Tenant container UI: minimum UI surface matches declared uiStrategy
- [OK] Mandatory output format: verification summary table produced before ui-api-deps.json delivery
- [OK] File delivery: output prepared as downloadable file, not inline code block
- [OK] CRITICAL RECURRING DEFECT warning present with three common violations
- [OK] Inline checkpoint requirement for per-page verification
- [OK] Example JSON demonstrates correct patterns (deferred with required:false, dependsOn usage, paramSource object usage, notes for capability)

**Validation Date:** 2026-02-05
**Status:** Production Ready

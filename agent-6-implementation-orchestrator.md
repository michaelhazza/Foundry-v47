# Agent 6: Implementation Orchestrator

## Version Reference
- **This Document**: agent-6-implementation-orchestrator.md v115
- **Linked Documents**:
  - agent-0-constitution.md
  - agent-1-product-definition.md
  - agent-2-system-architecture.md
  - agent-3-data-modeling.md
  - agent-4-api-contract.md
  - agent-5-ui-specification.md

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 115 | 2026-02 | **Framework Contradictions & Copy-Risk Elimination (PRODUCTION HARDENING):** Fixed four framework-level issues that would cause non-deterministic behavior or failures on reruns. (1) **Scope boundary clarification:** Changed "stop if writing TypeScript" to "Agent 6 includes TypeScript examples as reference documentation but does not generate app code files" - eliminates confusion between documentation examples and code generation. Error Response Standards section now clearly marked as "REFERENCE ONLY - For generated script context, not for direct output." (2) **Anti-copy-contamination in PROHIBITED PATTERNS:** Replaced all concrete literals (`processingJobs`, `canonicalSchemas`, `/health`, etc.) with non-literal placeholders (`<TABLE_NAME>`, `<RESOURCE_NAME>`, `<EXCEPTION_PATH>`) to prevent model from learning bad strings. Added explicit warning: "Never include literals that could appear in artifacts; Rule 7 discovers them dynamically." (3) **Safe jq string interpolation:** Changed verify-token-scoped-routing.sh to use `--arg p "$endpoint_path"` with `select(.path == $p)` instead of unsafe string interpolation that breaks on quotes/backslashes. (4) **MVP scope boundaries robustness:** Removed fragile pluralization heuristic (`/api/${resource}s`). Gate now checks: (a) deferredResources array exists and is non-empty, (b) warns if any endpoint path contains substring matching deferred resource name (loose check, not blocking). Framework-quality reusability maintained without brittle URL structure assumptions. Addresses "worked once, broken on rerun" feedback on v114. |
| 114 | 2026-02 | **Enforcement Quality & Schema Consistency (BLOCKING):** Fixed five issues in v113 that would cause broken gates or false positives. (1) **Isolation field path consistency:** Standardized all references to `.platformConstraints.multiTenancy.isolationField` (verify-token-scoped-routing.sh was using wrong path `.isolationScope.field` causing schema mismatch). (2) **Removed hardcoded runtime checks:** Eliminated `/api/health` and `/api/auth/login` curl commands from verify-error-handlers.sh guidance (violated Rule 6, will break on apps with different routes). Runtime validation now skipped - static checks only. (3) **Category 6 precision:** Constrained audit to only flag grep commands (added `^\s*grep\b` line match requirement) preventing false positives on docs/comments. (4) **scopeExceptions matching standardized:** All scopeException checks now use glob-style `[[ "$path" == $pattern ]]` (was mixing glob and regex). Consistent with `/api/auth/*` glob patterns. (5) **Categories 7-9 made artifact-driven:** Replaced literal string checks with dynamic discovery from artifacts. Now reads actual table/resource/path names from JSONs rather than hardcoding "processingJobs", "canonicalSchemas", etc. Prevents anti-copy-contamination regression and makes audit truly application-agnostic. Addresses framework-quality reusability feedback on v113. |
| 113 | 2026-02 | **Script Generation Enforcement Hardening (BLOCKING):** Strengthened SCRIPT-SPECIFIC GENERATION GUIDANCE to prevent hardcoded application values from appearing in generated scripts. (1) Changed all four script guidance sections (verify-project-scope-strategy, verify-mvp-scope-boundaries, verify-multi-tenant-isolation, verify-token-scoped-routing) from "examples" to "EXACT IMPLEMENTATION REQUIRED" - matching the gate-splitter.sh enforcement model. (2) Added PROHIBITED PATTERNS sections with specific antipatterns to avoid (e.g., `if [[ "$TABLE_NAME" == "processingJobs"`, `PLATFORM_RESOURCES=("canonicalSchemas"`, hardcoded /health or /api/auth/* paths). (3) Added endpoint path sanitization to run-all-gates.sh MANDATORY PATTERN section with exact sed command: `GATE_ID=$(echo "$ENDPOINT_PATH" | sed 's|^/||; s|/$||; s|/|-|g; s|[^a-zA-Z0-9_-]||g')`. (4) Enhanced Rule 7 hardcoding audit to include greps for these specific antipatterns. Prevents framework from generating scripts with Foundry-specific assumptions. Addresses feedback on v112 output where guidance was too weak to prevent hardcodes. |
| 112 | 2026-02 | **Application-Agnostic Gate Generation (BLOCKING):** Added script-specific generation guidance for four gates that previously contained hardcoded application-specific values. (1) **verify-project-scope-strategy.sh:** Must dynamically discover tenant-scoped entities from data-relationships.json (tenantKey:"direct") and validate their scoping fields exist, rather than hardcoding table names like "processingJobs" or "projectDataSources". (2) **verify-mvp-scope-boundaries.sh:** Must extract deferred platform resources from scope-manifest.json deferredResources array, not hardcode "canonicalSchemas" or "processingPipelines". (3) **verify-multi-tenant-isolation.sh & verify-token-scoped-routing.sh:** Must derive health/auth path exemptions from scope-manifest.json scopeExceptions, not hardcode "/health" or "/api/auth/*" patterns. (4) **run-all-gates.sh endpoint naming:** Must sanitize endpoint paths when generating gate IDs (replace / with -, strip special chars) to prevent edge cases with unusual characters. All four gates now fully artifact-driven per Rule 6. Prevents framework from generating Foundry-specific assumptions into other applications. Addresses feedback on v111 gate-scripts-reference.md output. |
| 111 | 2026-02 | **Hardcoded Directory Pattern Cleanup (Consistency Enhancement):** Addressed remaining hardcoded directory patterns in example code. (1) **verify-error-handlers Example Fix:** Replaced hardcoded `find server` with derived approach - extracts server directory from service-contracts.json first endpoint's routeFile path using `$(jq -r '.endpoints[0].routeFile' | sed 's\|/.*\|\|')`. Adds validation if directory cannot be derived. Eliminates Category 4 violation in example code. (2) **Build Execution Order Examples Warning:** Added explicit warning to Phase 0 verification gate examples (lines 1298-1299) that `find ./server` and `find ./client` are ILLUSTRATIVE ONLY and production gates must derive directories from artifacts per Rule 6 Category 4. Prevents copy-paste of hardcoded patterns. Addresses "extra risk" feedback: hardcoded find examples elsewhere could be copied into generated scripts. Note: v110 already fixed Issue A (componentFile → filePath) and Issue B (Rule 8 server/routes) completely - only VERSION HISTORY contains componentFile as documentation of the fix. |
| 110 | 2026-02 | **Cross-Agent Schema Alignment & Hardcoded Path Elimination (Defect Prevention):** Fixed two cross-agent drift and rule consistency issues. (1) **UI Schema Field Update (BLOCKING):** Changed all references from `componentFile` → `filePath` to align with Agent 5 v2 schema. Updated Rule 6 Page components example (line 664: `.pages[$i].componentFile` → `.pages[$i].filePath`) and BANNED PATTERNS table Category 4 (line 690: removed componentFile from artifact list, added filePath). Prevents gates from looking for non-existent field causing failures or false negatives. (2) **Rule 8 Hardcoded Path Elimination (HIGH RISK):** Replaced hardcoded `find server/routes` commands with derived approach from service-contracts.json. Rule 8 Detection Pattern now iterates over `.endpoints[].routeFile` using `jq -r '.endpoints[].routeFile' docs/service-contracts.json | sort -u` instead of `find server/routes -name "*.ts" -o -name "*.js"`. Eliminates Category 4 violation (hardcoded source directory) that conflicted with Rule 6's "no hardcoded source directories" ban. Prevents literal path pattern from being copied into generated scripts. Addresses feedback on v109: componentFile field doesn't exist in Agent 5 v2 schema (cross-agent drift), Rule 8 contradicts Rule 6 by hardcoding server/routes. |
| 109 | 2026-02 | **Output Structure Enforcement Hardening (Blocker Prevention):** Fixed #1 and #2 most common Agent 6 output defects. (1) Added CRITICAL OUTPUT REQUIREMENTS section before SPLITTABLE FORMAT SPECIFICATION with side-by-side WRONG/CORRECT examples showing orphan script code (WRONG) vs FILE-blocks-only structure (CORRECT). Emphasizes ZERO bash code may exist outside FILE blocks. (2) Strengthened Content Rules with ENFORCEMENT explanation: gate-splitter.sh ignores lines outside FILE blocks, orphan scripts will NOT be extracted. Added PRE-GENERATION CHECKLIST (5 items) to verify before delivery. Added "orphan scripts" to MUST NOT contain list. (3) Strengthened GATE SPLITTER UTILITY section: Changed header to "EXACT CONTENT REQUIRED", added CRITICAL warning that content at lines 151-259 is COMPLETE and REQUIRED implementation (not suggestion), listed required features (while IFS= read parser, declare -A seen_files duplicate detection, fail-fast, post-split verification, count validation), explicitly prohibited grep loops and alternative approaches. Addresses feedback on v108 output: gate-scripts-reference.md had script code outside FILE blocks (splitter skipped orphan script), gate-splitter.sh used grep loop without duplicate detection (violated exact content requirement). |
| 108 | 2026-02 | **Gate Discovery Sources Alignment:** Fixed self-contradiction in Gate Discovery Sources table. Agent 4 row now lists only 5 specification gates (verify-body-validation.sh, verify-upload-config-sourced.sh, verify-organisation-endpoint-naming.sh, verify-mvp-scope-boundaries.sh, verify-token-scoped-routing.sh). Agent 6 row now includes 5 implementation gates previously misattributed to Agent 4 (verify-endpoint-status.sh, verify-route-service-alignment.sh, verify-upload-e2e.sh, verify-pagination-max.sh, verify-status-enums.sh). Gate Discovery Sources table now matches MANDATORY SCRIPTS LIST attribution. Resolves v107 internal inconsistency. Addresses feedback on cross-file alignment. |
| 107 | 2026-02 | **Script Attribution Fix & Stale Count Cleanup:** (1) Fixed stale "28 scripts" statement in Build Transcript template section to "33 scripts". (2) Fixed cross-file script attribution mismatch: changed 5 Phase 4 scripts from "Agent 4" to "Agent 6" (verify-endpoint-status.sh, verify-route-service-alignment.sh, verify-upload-e2e.sh, verify-pagination-max.sh, verify-status-enums.sh) - these are implementation verification scripts that Agent 6 defines, not specification-level gates from Agent 4. (3) Removed non-deterministic Validation Date from prompt hygiene gate. Resolves enforcement gap where Agent 6 expected scripts Agent 4 doesn't define. Addresses feedback on v106 cross-file mismatch. |
| 106 | 2026-02 | **Cross-File Gate Alignment & Script Count Fixes:** (1) Added 3 missing Agent 4 gates to MANDATORY SCRIPTS LIST: verify-organisation-endpoint-naming.sh (#26), verify-mvp-scope-boundaries.sh (#27), verify-token-scoped-routing.sh (#28). (2) Updated all script counts: 30→33 total, 29→32 verification, EXPECTED_VERIFY_SCRIPTS 29→32, gate-splitter EXPECTED_SCRIPTS 28→33. (3) Added 5 missing scripts to PRE-COMPLETION VERIFICATION REQUIRED_SCRIPTS array. (4) Updated marker count expectations from 28 to 33. Resolves cross-file gate mismatch where Agent 4 defined gates not scheduled by Agent 6. Addresses feedback on v105 stale counts. |
| 105 | 2026-02 | Upload config sourcing gate integration: (1) Added verify-upload-config-sourced.sh to Phase 4 gate inventory (#25). (2) Updated EXPECTED_VERIFY_SCRIPTS from 28 to 29. (3) Updated total script counts (29 verification + 1 orchestrator = 30 total). (4) Updated all references to script counts in PRE-COMPLETION VERIFICATION, BUILD EXECUTION ORDER, and Gate Inventory. Aligns with Agent 4 v89 upload config verification enforcement. |
| 104 | 2026-02 | Body validation gate integration: (1) Added verify-body-validation.sh to Phase 4 gate inventory (#28). (2) Updated EXPECTED_VERIFY_SCRIPTS from 27 to 28. (3) Updated total script counts (28 verification + 1 orchestrator = 29 total). (4) Updated all references to script counts in PRE-COMPLETION VERIFICATION and BUILD EXECUTION ORDER. Aligns with Agent 4 v87 body validation discipline enforcement. |
| 103 | 2026-02 | Encoding and consistency fixes: (1) Replaced all mojibake sequences with ASCII -- em dashes, [X]/[OK] markers in anti-pattern examples, arrow in route-path prose. Zero non-ASCII remaining. (2) Updated split-first guard EXPECTED_VERIFY_SCRIPTS from 25 to 27. (3) Updated 02-ARCHITECTURE.md from optional to mandatory in INPUT section, matching Master Build Prompt v43. |
| 102 | 2026-02 | Fixed stale script count references: updated 6 occurrences of "26" to "28" in PRE-COMPLETION VERIFICATION, Script Extraction, Gate Inventory, and BUILD EXECUTION ORDER sections. Aligns with v101 inventory (27 verify scripts + run-all-gates.sh = 28). |
| 101 | 2026-02 | Build feedback: (1) Added verify-error-handlers.sh gate (Phase 4) -- validates JSON parse error handler and global error handler exist in Express entry file. (2) Added verify-schema-imports.sh gate (Phase 3) -- catches .js extensions in schema imports that break drizzle-kit. (3) Strengthened verify-multi-tenant-isolation.sh to cross-reference data-relationships.json tenantKey and exempt tenantKey:"none" entities from organisationId routeArgs check. (4) Anti-Pattern 4 escalation: >50% of route handlers with error-swallowing catch blocks now triggers blocking failure. Total scripts: 26 -> 28. |
| 100 | 2026-02 | Strengthened tenant isolation guidance: (1) Required pattern comment now explicitly covers all tenant-scoping contexts (database columns, routeArgs patterns, jq filters) not just column validation. (2) Banned Patterns row 1 expanded to call out routeArgs jq filters as a hardcoding surface. (3) Rule 7 Category 1 audit tightened: any hardcoded isolation field hit is now a violation regardless of variable ref count (prevents masking where correct usage in column checks hides hardcoding in routeArgs). |
| 99 | 2026-02 | Updated verify-index-strategy.sh to read explicit softDeleteColumn field from data-relationships.json (eliminates fragile heuristics). Strengthened Route Handler Error Patterns with Anti-Pattern 4 (swallowing all errors with generic 500) and added Rule 8 to Script Generation Rules for automated detection. Prevents CRITICAL defect where service-layer HTTP status codes are masked. |
| 98 | 2026-02 | Added Error Response Standards and Parameter Validation section. Includes HTTP status code standards (4xx vs 5xx), mandatory middleware stack (body parser, parameter validation, error handler), route handler patterns, and service layer error classes. Prevents 500 errors on invalid input. |
| 95 | 2026-02 | Anti-copy-contamination: (1) Removed all concrete application-specific literals from BANNED PATTERNS table -- replaced with natural-language descriptions so model cannot pattern-copy them into output. (2) Rewrote Rule 7 audit to be fully artifact-driven -- discovers what to scan for at runtime by reading the actual artifacts, so the audit script itself contains zero application literals. (3) Added HARD RULE: generated scripts must not contain any value that exists in input artifacts as a concrete value. (4) Verified zero encoding artifacts. |
| 94 | 2026-02 | Rule 6 expanded: Added BANNED PATTERNS table covering all 6 violation categories (soft-delete columns, health endpoints, source directories, middleware names, implementation pattern greps, framework-specific keywords). Added REPLACEMENT PATTERNS for each. Added Rule 7: POST-GENERATION AUDIT as mandatory grep-based self-check before completion. PRE-COMPLETION VERIFICATION now includes automated hardcoding scan. |
| 93 | 2026-02 | Rule 6 rewritten: Removed all WRONG examples containing app-specific literals (GPT was copying them into output). Rule now shows ONLY the correct artifact-derived patterns. Zero app-specific string literals remain in prompt. |
| 92 | 2026-02 | Audit fixes: (1) gate-splitter.sh now fails immediately on duplicate FILE blocks (prevents silent overwrite). (2) Strict content rules for gate-scripts-reference.md - FILE blocks only, no catalogue snippets. (3) Rule 6 strengthened with explicit banned patterns table. |
| 91 | 2026-02 | Audit fixes: (1) Preflight scope clarified - checks 5 spec JSONs + gate-scripts-reference.md only, NOT build outputs. (2) Post-split verification added to gate-splitter.sh (shebang + syntax checks). (3) New Rule 6: No Hardcoded Application Values - scripts must derive all field names/paths from JSON artifacts. (4) Split-first guard pattern added for run-all-gates.sh. |
| 90 | 2026-02 | MAJOR REFACTOR: Consolidated to splittable gate-scripts-reference.md. Agent 6 now outputs 4 files (was 26+). All scripts embedded in single reference file with #===== FILE: path =====# markers. Added gate-splitter.sh to extract individual scripts. PRE-COMPLETION VERIFICATION now counts FILE: markers. Eliminates duplicate content and simplifies spec phase. |
| 89 | 2026-02 | Added PRE-COMPLETION VERIFICATION section with executable self-check script. |
| 88 | 2026-02 | Added explicit scope boundary. Added MANDATORY SCRIPT LIST. Fixed run-all-gates.sh template to guard ALL seq loops. |
| 87 | 2026-02 | Converted to Linked Documents format. Added gate-scripts-reference.md. Added SCRIPT GENERATION RULES section. |

---

## ROLE

Generate gate scripts reference, splitter utility, and build proof templates. Fully automated -- zero manual intervention at any step.

---

## SCOPE BOUNDARY (CRITICAL)

**Agent 6 produces DOCUMENTATION only. Agent 6 does NOT write application code or individual script files.**

| Agent 6 DOES | Agent 6 does NOT |
|--------------|------------------|
| Generate `docs/gate-scripts-reference.md` (all scripts in one file) | Write individual script files |
| Generate `docs/gate-splitter.sh` (extraction utility) | Write server code |
| Generate `docs/build-gate-results.json` template | Write client code |
| Generate `docs/build-transcript.md` template | Write database schemas |
| Read specification artifacts from `docs/` | Implement any application logic |

**Downstream execution:** After Agent 6 outputs are complete, **Claude Code** runs `gate-splitter.sh` to extract individual scripts, then implements the application code and executes the gates.

**IMPORTANT DISTINCTION:** Agent 6 may include TypeScript, middleware, or route handler examples as **reference documentation** within script generation guidance (e.g., explaining what patterns gates should check for). These are NOT app code files - they document what gates should validate. Agent 6 DOES NOT generate app code files like `server/index.ts`, `routes/auth.ts`, or React components.

---

## FILE OUTPUT MANIFEST (4 FILES TOTAL)

**Agent 6 generates these files. Claude Code extracts scripts and populates actual results.**

| File | Path | Type | Purpose |
|------|------|------|---------|
| Gate Scripts Reference | docs/gate-scripts-reference.md | Documentation + Scripts | Single source of truth - contains ALL scripts with split markers |
| Gate Splitter | docs/gate-splitter.sh | Utility | Extracts individual scripts from reference file |
| Build Gate Results | docs/build-gate-results.json | Template | Populated by run-all-gates.sh at execution time |
| Build Transcript | docs/build-transcript.md | Template | Populated by run-all-gates.sh at execution time |

**Note:** Individual script files (`scripts/*.sh`) are NOT created by Agent 6. They are extracted by `gate-splitter.sh` when Claude Code runs it as Step 0 of the build.

**INPUT:** This agent reads all specification documents from `docs/`:
- docs/scope-manifest.json (Agent 1)
- docs/env-manifest.json (Agent 2)
- docs/data-relationships.json (Agent 3)
- docs/service-contracts.json (Agent 4)
- docs/ui-api-deps.json (Agent 5)
- docs/02-ARCHITECTURE.md (Agent 2, mandatory -- implementation patterns and ADRs)

---

## CRITICAL OUTPUT REQUIREMENTS (READ BEFORE GENERATING)

**These are the #1 and #2 most common defects in Agent 6 outputs. If you violate either requirement, the entire output is unusable.**

### Requirement 1: gate-scripts-reference.md Structure (BLOCKING)

**ZERO bash code may exist outside FILE blocks.**

```markdown
# ❌ WRONG - Script code before first FILE marker

#!/bin/bash
# Some orphan script code here...
echo "This code is outside any FILE block"

#===== FILE: scripts/verify-something.sh =====#
#!/bin/bash
...
#===== END FILE =====#
```

```markdown
# ✅ CORRECT - Header, then FILE blocks ONLY

# Gate Scripts Reference

> Generated by Agent 6. Run `bash docs/gate-splitter.sh` to extract individual scripts.

**Total Scripts:** 33
**Split Command:** `bash docs/gate-splitter.sh`

---

#===== FILE: scripts/verify-something.sh =====#
#!/bin/bash
...
#===== END FILE =====#

#===== FILE: scripts/verify-another.sh =====#
#!/bin/bash
...
#===== END FILE =====#
```

**If you have bash code ANYWHERE except:**
1. Inside `#===== FILE: ... =====#` / `#===== END FILE =====#` delimiters

**Then your output is INVALID and gate-splitter.sh will not extract that script.**

### Requirement 2: gate-splitter.sh Implementation (BLOCKING)

**You MUST generate gate-splitter.sh with the EXACT content shown in section "GATE SPLITTER UTILITY".**

**Do NOT:**
- Use `grep -n` loops instead of the mandated `while IFS= read` parser
- Skip duplicate detection (the `declare -A seen_files` logic is MANDATORY)
- Skip post-split verification (shebang, syntax, executable checks)

**The gate-splitter.sh content at lines 151-259 is NOT a suggestion - it is the REQUIRED implementation.**

If your gate-splitter.sh differs from the mandated content, it is INVALID even if it "works" - other parts of the framework depend on the exact behaviour (duplicate detection, error messages, exit codes).

---

## SPLITTABLE FORMAT SPECIFICATION

The `gate-scripts-reference.md` file uses unambiguous delimiters that are easy to parse:

### File Structure

```markdown
# Gate Scripts Reference

> Generated by Agent 6. Run `bash docs/gate-splitter.sh` to extract individual scripts.

**Total Scripts:** {count}
**Split Command:** `bash docs/gate-splitter.sh`

---

#===== FILE: scripts/run-all-gates.sh =====#
#!/bin/bash
# scripts/run-all-gates.sh
# GENERATED BY AGENT 6 - DO NOT EDIT MANUALLY
set -euo pipefail
...script content...
#===== END FILE =====#

#===== FILE: scripts/verify-preflight-artifacts.sh =====#
#!/bin/bash
# scripts/verify-preflight-artifacts.sh
set -euo pipefail
...script content...
#===== END FILE =====#

... [repeat for all scripts]
```

### Delimiter Rules

| Delimiter | Purpose | Format |
|-----------|---------|--------|
| `#===== FILE: {path} =====#` | Start of script | Path is relative to repo root |
| `#===== END FILE =====#` | End of script | Must match a preceding FILE marker |

**CRITICAL:** Delimiters MUST be on their own line with no leading whitespace. The `#` at the start ensures they are valid bash comments if accidentally executed.

### Content Rules (STRICT)

The `gate-scripts-reference.md` file MUST contain ONLY:

1. **Header section** -- title, generation metadata, total script count, split command
2. **FILE blocks** -- one per script, using the `#===== FILE: path =====#` / `#===== END FILE =====#` delimiters

**MUST NOT contain:**
- "Catalogue" sections with duplicate script code outside FILE blocks
- Headings like `## verify-something.sh` with standalone code blocks
- Any bash code that is not inside a FILE block
- Commentary or documentation between FILE blocks (use comments inside the scripts instead)
- **Orphan scripts** - any script content appearing before the first FILE marker or after the last END FILE marker

**ENFORCEMENT:** The gate-splitter.sh parser processes the file line-by-line:
- Lines outside FILE blocks (except the header) are IGNORED
- If a script appears outside a FILE block, it will NOT be extracted
- If you have 33 scripts but only 32 FILE blocks, you will get 32 scripts and a count mismatch failure

**Each script path MUST appear exactly once.** If `gate-splitter.sh` encounters the same FILE path twice, it MUST fail immediately. This prevents silent overwrites where an older version of a script replaces a newer one.

**PRE-GENERATION CHECKLIST:**
Before delivering gate-scripts-reference.md, verify:
- [ ] File starts with header section
- [ ] First line of bash code is immediately after a `#===== FILE:` marker
- [ ] Every script has both `#===== FILE:` and `#===== END FILE =====#` markers
- [ ] Zero bash code exists outside FILE blocks
- [ ] No duplicate FILE paths

---

## GATE SPLITTER UTILITY (EXACT CONTENT REQUIRED)

**CRITICAL:** Agent 6 MUST generate `docs/gate-splitter.sh` with this EXACT content. Do NOT modify the implementation, do NOT use alternative parsing approaches, do NOT skip any checks.

**Required features:**
- `while IFS= read -r line` parser (NOT grep loops)
- `declare -A seen_files` for duplicate detection (MANDATORY)
- Fail-fast on duplicate FILE paths with descriptive error
- Post-split verification (shebang, syntax, executable checks)
- Expected script count validation

**The following content is the COMPLETE and REQUIRED implementation:**

```bash
#!/bin/bash
# docs/gate-splitter.sh
# Extracts individual scripts from gate-scripts-reference.md
# Run this BEFORE implementation begins
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REFERENCE_FILE="$SCRIPT_DIR/gate-scripts-reference.md"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ ! -f "$REFERENCE_FILE" ]]; then
  echo "[X] ERROR: gate-scripts-reference.md not found"
  exit 1
fi

mkdir -p "$PROJECT_ROOT/scripts"

echo "=== Extracting scripts from gate-scripts-reference.md ==="

current_file=""
line_count=0
file_count=0
declare -A seen_files

while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ "$line" =~ ^#=====\ FILE:\ (.+)\ =====# ]]; then
    current_file="${BASH_REMATCH[1]}"
    
    # Fail-fast on duplicate FILE paths
    if [[ -n "${seen_files[$current_file]+x}" ]]; then
      echo ""
      echo "[X] FATAL: Duplicate FILE block detected: $current_file"
      echo "    First seen at extraction #${seen_files[$current_file]}"
      echo "    gate-scripts-reference.md must contain exactly one block per script."
      exit 1
    fi
    
    mkdir -p "$(dirname "$PROJECT_ROOT/$current_file")"
    > "$PROJECT_ROOT/$current_file"
    line_count=0
    file_count=$((file_count + 1))
    seen_files[$current_file]=$file_count
    echo "  Creating: $current_file"
  elif [[ "$line" =~ ^#=====\ END\ FILE\ =====# ]]; then
    if [[ -n "$current_file" ]]; then
      chmod +x "$PROJECT_ROOT/$current_file"
    fi
    current_file=""
  elif [[ -n "$current_file" ]]; then
    echo "$line" >> "$PROJECT_ROOT/$current_file"
    line_count=$((line_count + 1))
  fi
done < "$REFERENCE_FILE"

echo ""
echo "=== Extraction Complete ==="
echo "Created $file_count scripts in $PROJECT_ROOT/scripts/"

# Verify expected count
EXPECTED_SCRIPTS=33
if [[ $file_count -lt $EXPECTED_SCRIPTS ]]; then
  echo "[X] Expected $EXPECTED_SCRIPTS scripts, created $file_count"
  exit 1
fi

# Post-split verification
echo ""
echo "=== Post-Split Verification ==="
VERIFY_FAILURES=0

for script in "$PROJECT_ROOT"/scripts/*.sh; do
  script_name=$(basename "$script")
  
  # Check shebang
  first_line=$(head -1 "$script")
  if [[ "$first_line" != "#!/bin/bash" ]]; then
    echo "  [X] $script_name: Missing or incorrect shebang (got: $first_line)"
    VERIFY_FAILURES=$((VERIFY_FAILURES + 1))
    continue
  fi
  
  # Check syntax (bash -n parses without executing)
  if ! bash -n "$script" 2>/dev/null; then
    echo "  [X] $script_name: Syntax error detected"
    VERIFY_FAILURES=$((VERIFY_FAILURES + 1))
    continue
  fi
  
  # Check executable
  if [[ ! -x "$script" ]]; then
    echo "  [X] $script_name: Not executable"
    VERIFY_FAILURES=$((VERIFY_FAILURES + 1))
    continue
  fi
  
  echo "  [OK] $script_name"
done

if [[ $VERIFY_FAILURES -gt 0 ]]; then
  echo ""
  echo "[X] Post-split verification failed: $VERIFY_FAILURES scripts have issues"
  exit 1
fi

echo ""
echo "[OK] All $file_count scripts extracted and verified"
exit 0
```

---

## MANDATORY SCRIPTS LIST

The following scripts MUST appear in `gate-scripts-reference.md` with `#===== FILE: path =====#` markers.

### Orchestrator (1 script)

| Script | Purpose |
|--------|---------|
| `scripts/run-all-gates.sh` | Executes all gates, produces build-gate-results.json |

### Verification Scripts (32 scripts)

| # | Script | Phase | Source Agent |
|---|--------|-------|--------------|
| 1 | `scripts/verify-preflight-artifacts.sh` | 0 | Agent 6 |
| 2 | `scripts/verify-no-forbidden-artifacts.sh` | 0 | Agent 6 |
| 3 | `scripts/verify-spec-size-budget.sh` | 0 | Agent 6 |
| 4 | `scripts/verify-no-placeholders.sh` | 0 | Agent 6 |
| 5 | `scripts/verify-env-var-usage-proof.sh` | 0 | Agent 6 |
| 6 | `scripts/verify-multi-tenant-isolation.sh` | 0 | Agent 6 |
| 7 | `scripts/verify-scope-invariants.sh` | 1 | Agent 1 |
| 8 | `scripts/verify-complete-deferrals.sh` | 1 | Agent 1 |
| 9 | `scripts/verify-env-manifest-schema.sh` | 2 | Agent 2 |
| 10 | `scripts/verify-config-files-required.sh` | 2 | Agent 2 |
| 11 | `scripts/verify-health-db-connectivity.sh` | 2 | Agent 2 |
| 12 | `scripts/verify-no-wildcard-cors.sh` | 2 | Agent 2 |
| 13 | `scripts/verify-encryption-binary.sh` | 2 | Agent 2 |
| 14 | `scripts/verify-cascade-completeness.sh` | 3 | Agent 3 |
| 15 | `scripts/verify-project-scope-strategy.sh` | 3 | Agent 3 |
| 16 | `scripts/verify-index-strategy.sh` | 3 | Agent 3 |
| 17 | `scripts/verify-schema-imports.sh` | 3 | Agent 2 |
| 18 | `scripts/verify-endpoint-status.sh` | 4 | Agent 6 |
| 19 | `scripts/verify-route-service-alignment.sh` | 4 | Agent 6 |
| 20 | `scripts/verify-upload-e2e.sh` | 4 | Agent 6 |
| 21 | `scripts/verify-pagination-max.sh` | 4 | Agent 6 |
| 22 | `scripts/verify-status-enums.sh` | 4 | Agent 6 |
| 23 | `scripts/verify-error-handlers.sh` | 4 | Agent 6 |
| 24 | `scripts/verify-body-validation.sh` | 4 | Agent 4 |
| 25 | `scripts/verify-upload-config-sourced.sh` | 4 | Agent 4 |
| 26 | `scripts/verify-organisation-endpoint-naming.sh` | 4 | Agent 4 |
| 27 | `scripts/verify-mvp-scope-boundaries.sh` | 4 | Agent 4 |
| 28 | `scripts/verify-token-scoped-routing.sh` | 4 | Agent 4 |
| 29 | `scripts/verify-ui-canonical-paths.sh` | 5 | Agent 5 |
| 30 | `scripts/verify-ui-api-alignment.sh` | 5 | Agent 5 |
| 31 | `scripts/verify-ui-self-consistency.sh` | 5 | Agent 5 |
| 32 | `scripts/verify-no-deferred-pages.sh` | 5 | Agent 5 |

**Total: 33 scripts (1 orchestrator + 32 verification)**

---

## PREFLIGHT SCOPE (WHAT verify-preflight-artifacts.sh CHECKS)

Preflight validates that the **specification inputs** exist before implementation begins. It does NOT check for build outputs.

**Preflight MUST check (6 files):**

| File | Why |
|------|-----|
| docs/scope-manifest.json | Agent 1 spec input |
| docs/env-manifest.json | Agent 2 spec input |
| docs/data-relationships.json | Agent 3 spec input |
| docs/service-contracts.json | Agent 4 spec input |
| docs/ui-api-deps.json | Agent 5 spec input |
| docs/gate-scripts-reference.md | Agent 6 consolidated scripts |

**Preflight MUST NOT check:**

| File | Why excluded |
|------|-------------|
| docs/build-gate-results.json | Build output - does not exist until gates run |
| docs/build-transcript.md | Build output - does not exist until gates run |

These build outputs are validated separately after gate execution (Phase 8 in the build flow). Checking for them in preflight creates a circular dependency: preflight requires files that are produced by the very gates preflight enables.

---

## PRE-COMPLETION VERIFICATION (MANDATORY)

Before Agent 6 declares completion, it MUST execute BOTH checks in this order:

1. **Rule 7 Post-Generation Hardcoding Audit** (see Rule 7 above) -- must PASS first
2. **Structural Verification** below -- confirms all files and markers present

If the Rule 7 audit finds ANY violations, STOP and fix them before running structural verification.

```bash
#!/bin/bash
# Agent 6 Pre-Completion Verification
# Run this AFTER Rule 7 audit passes
set -euo pipefail

echo "=== Agent 6 Pre-Completion Verification ==="

DOCS_DIR="docs"
MISSING=0

# Check required output files exist
REQUIRED_FILES=(
  "gate-scripts-reference.md"
  "gate-splitter.sh"
  "build-gate-results.json"
  "build-transcript.md"
)

echo ""
echo "Checking docs/ directory for required files..."
for file in "${REQUIRED_FILES[@]}"; do
  if [[ -f "$DOCS_DIR/$file" ]]; then
    echo "  [OK] $file"
  else
    echo "  [MISSING] $file"
    MISSING=$((MISSING + 1))
  fi
done

# Check gate-scripts-reference.md contains all required FILE: markers
echo ""
echo "Checking gate-scripts-reference.md for script markers..."

REQUIRED_SCRIPTS=(
  "scripts/run-all-gates.sh"
  "scripts/verify-preflight-artifacts.sh"
  "scripts/verify-no-forbidden-artifacts.sh"
  "scripts/verify-spec-size-budget.sh"
  "scripts/verify-no-placeholders.sh"
  "scripts/verify-env-var-usage-proof.sh"
  "scripts/verify-multi-tenant-isolation.sh"
  "scripts/verify-scope-invariants.sh"
  "scripts/verify-complete-deferrals.sh"
  "scripts/verify-env-manifest-schema.sh"
  "scripts/verify-config-files-required.sh"
  "scripts/verify-health-db-connectivity.sh"
  "scripts/verify-no-wildcard-cors.sh"
  "scripts/verify-encryption-binary.sh"
  "scripts/verify-cascade-completeness.sh"
  "scripts/verify-project-scope-strategy.sh"
  "scripts/verify-index-strategy.sh"
  "scripts/verify-schema-imports.sh"
  "scripts/verify-endpoint-status.sh"
  "scripts/verify-route-service-alignment.sh"
  "scripts/verify-upload-e2e.sh"
  "scripts/verify-pagination-max.sh"
  "scripts/verify-status-enums.sh"
  "scripts/verify-error-handlers.sh"
  "scripts/verify-body-validation.sh"
  "scripts/verify-upload-config-sourced.sh"
  "scripts/verify-organisation-endpoint-naming.sh"
  "scripts/verify-mvp-scope-boundaries.sh"
  "scripts/verify-token-scoped-routing.sh"
  "scripts/verify-ui-canonical-paths.sh"
  "scripts/verify-ui-api-alignment.sh"
  "scripts/verify-ui-self-consistency.sh"
  "scripts/verify-no-deferred-pages.sh"
)

if [[ -f "$DOCS_DIR/gate-scripts-reference.md" ]]; then
  for script in "${REQUIRED_SCRIPTS[@]}"; do
    if grep -q "#===== FILE: $script =====#" "$DOCS_DIR/gate-scripts-reference.md"; then
      echo "  [OK] $script"
    else
      echo "  [MISSING] $script marker not found"
      MISSING=$((MISSING + 1))
    fi
  done
  
  # Count total FILE: markers
  MARKER_COUNT=$(grep -c "#===== FILE:" "$DOCS_DIR/gate-scripts-reference.md" || echo "0")
  echo ""
  echo "FILE: markers found: $MARKER_COUNT (expected: 33)"
else
  echo "  [SKIP] Cannot check markers - file missing"
fi

echo ""
echo "=========================================="
if [[ $MISSING -gt 0 ]]; then
  echo "[FAIL] Agent 6 incomplete: $MISSING items missing"
  echo "DO NOT proceed until all files and markers are present."
  exit 1
else
  echo "[PASS] Agent 6 complete: All 4 files + 33 script markers present"
  echo "Ready for Claude Code to run gate-splitter.sh"
  exit 0
fi
```

**CRITICAL:** If this verification fails, Agent 6 MUST fix the missing items before completing.

---

## SCRIPT GENERATION RULES (CRITICAL)

When generating scripts for inclusion in `gate-scripts-reference.md`, Agent 6 MUST follow these rules:

### Rule 1: `local` Variables Only Inside Functions

```bash
# WRONG - crashes with "local: can only be used in a function"
{
  local first=true  # ERROR
} > file.json

# CORRECT - wrap in function
write_results() {
  local first=true  # OK inside function
}
write_results > file.json
```

### Rule 2: run_gate() Must Accept Arguments Separately

```bash
# WRONG - args in path string fails -f check
run_gate "entity-table" "$SCRIPT_DIR/verify-entity-table.sh $entity" ...

# CORRECT - args as separate parameters
run_gate() {
  local gate_name="$1"
  local gate_script="$2"
  shift 2
  local script_args=("$@")
  
  if [[ ${#script_args[@]} -gt 0 ]]; then
    output=$("$gate_script" "${script_args[@]}" 2>&1)
  else
    output=$("$gate_script" 2>&1)
  fi
}
```

### Rule 3: Guard ALL Loops for Zero-Length Arrays (CRITICAL)

Every loop over a jq-derived count MUST be guarded:

```bash
# WRONG - seq 0 -1 crashes when COUNT is 0
TABLE_COUNT=$(jq '.tables | length' "$FILE")
for i in $(seq 0 $((TABLE_COUNT - 1))); do
  ...
done

# CORRECT - always guard with if COUNT -gt 0
TABLE_COUNT=$(jq '.tables | length' "$FILE")
if [[ $TABLE_COUNT -gt 0 ]]; then
  for i in $(seq 0 $((TABLE_COUNT - 1))); do
    ...
  done
fi
```

### Rule 4: Never Overwrite Reserved Variable Names

```bash
# WRONG - overwrites shell PATH
PATH=$(jq -r ".endpoints[$i].path" "$FILE")

# CORRECT - use descriptive names
endpoint_path=$(jq -r ".endpoints[$i].path" "$FILE")
```

Reserved names to avoid: `PATH`, `HOME`, `USER`, `SHELL`, `PWD`, `IFS`

### Rule 5: Ensure Output Directories Exist

```bash
# At script start:
mkdir -p "$PROJECT_ROOT/docs"
mkdir -p "$PROJECT_ROOT/scripts"
```

### Rule 6: No Hardcoded Application Values (APPLICATION-AGNOSTIC)

Scripts MUST derive all entity names, field names, file paths, and domain-specific values from the JSON artifacts at runtime. Never hardcode values that are specific to a particular application.

**Every variable value must come from a JSON artifact.** The only hardcoded paths permitted are the artifact files themselves (e.g., `docs/scope-manifest.json`).

**Required patterns -- use ONLY these approaches:**

**Tenant isolation field** -- read from scope-manifest.json:
```bash
ISOLATION_FIELD=$(jq -r '.platformConstraints.multiTenancy.isolationField // empty' docs/scope-manifest.json)
if [[ -n "$ISOLATION_FIELD" ]]; then
  # Use $ISOLATION_FIELD in ALL tenant-scoping checks: database column validation,
  # routeArgs pattern matching (e.g., contains($ISOLATION_FIELD)), jq filters,
  # and any other assertion involving the tenant field. NEVER hardcode the field name.
  ...
fi
```

**File paths** -- read from the relevant artifact:
```bash
# Env validation files
VALIDATED_IN=$(jq -r ".required[$i].validatedInFile" docs/env-manifest.json)
if [[ -n "$VALIDATED_IN" && -f "$VALIDATED_IN" ]]; then ...

# Route files
ROUTE_FILE=$(jq -r ".endpoints[$i].routeFile" docs/service-contracts.json)
if [[ -n "$ROUTE_FILE" && -f "$ROUTE_FILE" ]]; then ...

# Service files
SERVICE_FILE=$(jq -r ".endpoints[$i].serviceContract.serviceFile" docs/service-contracts.json)
if [[ -n "$SERVICE_FILE" && -f "$SERVICE_FILE" ]]; then ...
```

**Entity and table names** -- iterate from data-relationships.json:
```bash
TABLE_NAME=$(jq -r ".tables[$i].name" docs/data-relationships.json)
# Use $TABLE_NAME -- never write a literal entity name
```

**Page components** -- iterate from ui-api-deps.json:
```bash
PAGE_FILE=$(jq -r ".pages[$i].filePath" docs/ui-api-deps.json)
# Use $PAGE_FILE -- never write a literal component path
```

**Index validation** -- derive the column name from the artifact:
```bash
TENANT_FIELD=$(jq -r '.platformConstraints.multiTenancy.isolationField // empty' docs/scope-manifest.json)
if [[ -n "$TENANT_FIELD" ]]; then
  # Check that indexes include $TENANT_FIELD -- never use a literal column name
  ...
fi
```

**Test:** Before generating any script, ask: "Does this script contain any string literal that would be different for a different application?" If yes, replace it with a jq read from the appropriate artifact.

#### BANNED PATTERNS TABLE (CRITICAL)

These are the six categories of hardcoding that MUST NOT appear in generated scripts. Each has been observed in prior failed outputs.

**DO NOT COPY any example values from this table into generated scripts. The examples exist only to help you recognise violations -- they must never appear in output files.**

| # | Category | What to look for | Why it fails | Correct replacement |
|---|----------|-----------------|--------------|---------------------|
| 1 | Tenant isolation field | Any hardcoded field name used for tenant scoping -- in database column checks, routeArgs jq filters (e.g., `contains("...")` or `select(. == "...")`), or any other tenant-related assertion | Different apps use different isolation field names | Read `platformConstraints.multiTenancy.isolationField` from scope-manifest.json into a variable and use only that variable in ALL contexts |
| 2 | Soft-delete column name | Any hardcoded column name used for soft-delete timestamps (whatever the app calls its "is this row deleted" column) | Different apps name this column differently | Derive from data-relationships.json: find nullable timestamp columns per table, or read from a `softDeleteColumn` field if the artifact defines one |
| 3 | Health endpoint path | Any hardcoded URL path string used to locate the health-check route (the literal path the app mounts it on) | Different apps mount health checks at different paths | Find endpoint by `purpose` field in service-contracts.json (filter where `serviceContract.purpose` equals the health-check purpose string) -- never select by hardcoded path |
| 4 | Source directory paths | Any hardcoded top-level directory names for application source code (whatever folders the app uses for backend and frontend code) | Different apps have different directory structures | Derive directories from the union of all file paths declared in artifacts (routeFile, serviceFile, filePath, validatedInFile) -- extract unique top-level directory segments at runtime |
| 5 | Framework-specific middleware or library names | Any hardcoded library or middleware name used in grep patterns to verify implementation (the specific npm packages or framework modules the app uses) | Different frameworks use different libraries | Read middleware names from the endpoint's `middleware` array in service-contracts.json, or check only for file existence (not implementation keywords) |
| 6 | Implementation-keyword greps | Any grep pattern that searches source code for implementation-specific keywords (database driver terms, ORM method names, etc.) | Checking for implementation keywords is fragile and framework-specific | Remove implementation-keyword greps entirely -- verify file existence and artifact declarations instead. If a service file is declared and exists, that is sufficient proof |

**Recognition test for each script line:** "If I changed the application this framework is building, would this string literal need to change?" If yes, it MUST be replaced with a jq read from the appropriate artifact.

#### REPLACEMENT PATTERNS FOR EACH CATEGORY

**Category 2 -- Soft-delete column:**
```bash
# Derive soft-delete column from table's nullable timestamp columns
SOFT_DELETE_COL=$(jq -r --arg t "$TABLE_NAME" \
  '[.tables[] | select(.name == $t) | .columns[] | select(.nullable == true and .type == "timestamp")] | .[0].name // empty' "$DATA_REL")
if [[ -n "$SOFT_DELETE_COL" ]]; then
  HAS_SD_INDEX=$(jq --arg t "$TABLE_NAME" --arg sd "$SOFT_DELETE_COL" \
    '[.tables[] | select(.name == $t) | .indexes[] | .columns[] | select(. == $sd)] | length' "$DATA_REL")
  # ... validate index includes $SOFT_DELETE_COL
fi
```

**Category 3 -- Health endpoint:**
```bash
# Find health endpoint by purpose, not by hardcoded path
HEALTH_ENDPOINT=$(jq -r '[.endpoints[] | select(.serviceContract.purpose == "healthCheck")] | .[0] // empty' "$SERVICE_CONTRACTS")
HEALTH_ROUTE_FILE=$(echo "$HEALTH_ENDPOINT" | jq -r '.routeFile // empty')
HEALTH_SERVICE_FILE=$(echo "$HEALTH_ENDPOINT" | jq -r '.serviceContract.serviceFile // empty')
HEALTH_PATH=$(echo "$HEALTH_ENDPOINT" | jq -r '.path // empty')
# Validate file existence -- do NOT grep for implementation keywords
```

**Category 4 -- Source directories:**
```bash
# Derive source directories from all artifact file paths
SEARCH_DIRS=()
for artifact in "$PROJECT_ROOT/docs/service-contracts.json" \
  "$PROJECT_ROOT/docs/data-relationships.json" \
  "$PROJECT_ROOT/docs/ui-api-deps.json" \
  "$PROJECT_ROOT/docs/env-manifest.json"; do
  if [[ -f "$artifact" ]]; then
    while IFS= read -r dir; do
      if [[ -n "$dir" && -d "$PROJECT_ROOT/$dir" ]]; then
        SEARCH_DIRS+=("$dir")
      fi
    done < <(grep -oP '"[^"]*\.(ts|tsx|js|jsx)"' "$artifact" | tr -d '"' | sed 's|/.*||' | sort -u)
  fi
done
SEARCH_DIRS=($(printf '%s\n' "${SEARCH_DIRS[@]}" | sort -u))
```

**Category 5 -- Middleware validation:**
```bash
# Read middleware from artifact, not hardcoded names
MW_COUNT=$(jq ".endpoints[$i].middleware | length" "$SERVICE_CONTRACTS")
if [[ $MW_COUNT -gt 0 ]]; then
  for mw_idx in $(seq 0 $((MW_COUNT - 1))); do
    MW_NAME=$(jq -r ".endpoints[$i].middleware[$mw_idx]" "$SERVICE_CONTRACTS")
    # Check that route file references $MW_NAME
  done
fi
```

**Acceptable hardcoded values (NOT violations):**

These are framework-level schema field names that are defined BY the agent framework itself, not by any specific application:

- Field names when validating artifact schema structure (e.g., checking that env-manifest entries have `"name"`, `"usage"`, `"validatedInFile"` fields) -- these are the framework's own schema requirements
- Artifact file paths (e.g., `docs/scope-manifest.json`)
- jq structural operators (e.g., `| length`, `// empty`)
- Build output field names (e.g., `"gate"`, `"status"`, `"output"` in build-gate-results.json)
- Placeholder detection patterns (`TODO`, `FIXME`, `PLACEHOLDER`, `XXX`, `HACK`) -- these are universal dev conventions
- **Framework-defined purpose constants:** The `purpose` field values in service-contracts.json (e.g., `"healthCheck"`) are framework constants defined by Agent 4's schema, not application-specific values. Scripts MAY use `select(.serviceContract.purpose == "healthCheck")` because Agent 4 guarantees this value for health endpoints across all applications. This is distinct from hardcoding the endpoint's *path* (which IS application-specific).

### Rule 7: POST-GENERATION AUDIT (MANDATORY)

After generating ALL scripts in gate-scripts-reference.md, Agent 6 MUST perform an automated hardcoding scan. This runs BEFORE the PRE-COMPLETION structural verification.

**How the audit works:** Agent 6 builds the list of application-specific values dynamically FROM the artifacts, then checks whether any of those values appear as hardcoded literals in the generated scripts. This means the audit itself is application-agnostic -- it discovers what to scan for at runtime.

```bash
echo "=== Rule 7: Post-Generation Hardcoding Audit ==="
VIOLATIONS=0

SCOPE_MANIFEST="docs/scope-manifest.json"
DATA_REL="docs/data-relationships.json"
SERVICE_CONTRACTS="docs/service-contracts.json"
REFERENCE="docs/gate-scripts-reference.md"

# Category 1: Tenant isolation field
# Read the actual isolation field name from scope-manifest, then check it does NOT appear as a hardcoded literal
ISOLATION_COL=$(jq -r '.platformConstraints.multiTenancy.isolationField // empty' "$SCOPE_MANIFEST")
if [[ -n "$ISOLATION_COL" ]]; then
  # Check for the field name used as a hardcoded string anywhere (column checks, routeArgs, jq filters)
  # A valid use is: --arg f "$ISOLATION_FIELD" ... contains($f)
  # A violation is: contains("<the actual field name>") or select(. == "<the actual field name>")
  HARDCODED_HITS=$(grep -cP "\"${ISOLATION_COL}\"" "$REFERENCE" || true)
  if [[ $HARDCODED_HITS -gt 0 ]]; then
    echo "[X] Category 1: Isolation field name appears as hardcoded literal ($HARDCODED_HITS times)"
    grep -nP "\"${ISOLATION_COL}\"" "$REFERENCE"
    VIOLATIONS=$((VIOLATIONS + 1))
  else
    echo "[OK] Category 1: Tenant isolation field is variable-driven"
  fi
fi

# Category 2: Soft-delete column names
# Read all nullable timestamp column names, check none appear as hardcoded literals in jq select() calls
if [[ -f "$DATA_REL" ]]; then
  SD_COLS=$(jq -r '[.tables[].columns[] | select(.nullable == true and .type == "timestamp") | .name] | unique | .[]' "$DATA_REL" 2>/dev/null || true)
  for col in $SD_COLS; do
    if grep -qP "select.*==.*\"${col}\"" "$REFERENCE"; then
      echo "[X] Category 2: Soft-delete column '$col' used as hardcoded literal in select()"
      grep -nP "select.*==.*\"${col}\"" "$REFERENCE"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  done
  if [[ $VIOLATIONS -eq 0 ]] || ! echo "$SD_COLS" | grep -q .; then
    echo "[OK] Category 2: Soft-delete columns are variable-driven"
  fi
fi

# Category 3: Health endpoint path
# Read the actual health endpoint path, check it does NOT appear in a hardcoded select(.path == "...")
if [[ -f "$SERVICE_CONTRACTS" ]]; then
  HEALTH_PATH=$(jq -r '[.endpoints[] | select(.serviceContract.purpose == "healthCheck")] | .[0].path // empty' "$SERVICE_CONTRACTS")
  if [[ -n "$HEALTH_PATH" ]]; then
    if grep -qP "select\(\.path\s*==\s*\"${HEALTH_PATH}\"" "$REFERENCE"; then
      echo "[X] Category 3: Health endpoint path appears as hardcoded literal in select()"
      grep -nP "select\(\.path.*\"${HEALTH_PATH}\"" "$REFERENCE"
      VIOLATIONS=$((VIOLATIONS + 1))
    else
      echo "[OK] Category 3: Health endpoint is looked up by purpose, not path"
    fi
  fi
fi

# Category 4: Source directories
# Read all unique top-level dirs from artifact file paths, check none appear in hardcoded "for dir in ..." loops
if [[ -f "$SERVICE_CONTRACTS" ]]; then
  APP_DIRS=$(jq -r '[.endpoints[].routeFile, .endpoints[].serviceContract.serviceFile] | map(select(. != null) | split("/")[0]) | unique | .[]' "$SERVICE_CONTRACTS" 2>/dev/null || true)
  for d in $APP_DIRS; do
    if grep -qP "for dir in.*\"${d}\"" "$REFERENCE"; then
      echo "[X] Category 4: Source directory '$d' appears as hardcoded literal in loop"
      grep -nP "\"${d}\"" "$REFERENCE"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  done
fi

# Category 5: Middleware names in grep patterns
# Read all middleware names from artifacts, check none appear as hardcoded grep patterns
if [[ -f "$SERVICE_CONTRACTS" ]]; then
  MW_NAMES=$(jq -r '[.endpoints[].middleware[]?] | unique | .[]' "$SERVICE_CONTRACTS" 2>/dev/null || true)
  for mw in $MW_NAMES; do
    if grep -qP "grep.*\"${mw}\"" "$REFERENCE" || grep -qP "grep.*${mw}" "$REFERENCE"; then
      # Only flag if it's in a grep pattern (not in a jq read)
      GREP_HITS=$(grep -cP "grep.*${mw}" "$REFERENCE" || true)
      JQ_HITS=$(grep -cP "jq.*${mw}\|middleware" "$REFERENCE" || true)
      if [[ $GREP_HITS -gt 0 ]]; then
        echo "[X] Category 5: Middleware '$mw' used as hardcoded grep pattern"
        VIOLATIONS=$((VIOLATIONS + 1))
      fi
    fi
  done
fi

# Category 6: Implementation-keyword greps
# Check for multi-keyword grep patterns only in actual grep commands (not comments/docs)
# Constrain to lines that start with 'grep' to avoid false positives
CAT6_VIOLATIONS=0
while IFS= read -r line_num; do
  line=$(sed -n "${line_num}p" "$REFERENCE")
  # Only flag if it's an actual grep command line
  if echo "$line" | grep -qP '^\s*grep\b.*"[a-z]+\|[a-z]+\|[a-z]+"'; then
    if [[ $CAT6_VIOLATIONS -eq 0 ]]; then
      echo "[X] Category 6: Multi-keyword implementation grep detected in actual grep commands"
    fi
    echo "  Line $line_num: $line"
    CAT6_VIOLATIONS=$((CAT6_VIOLATIONS + 1))
  fi
done < <(grep -nP 'grep.*"[a-z]+\\|[a-z]+\\|[a-z]+"' "$REFERENCE" | cut -d: -f1)

if [[ $CAT6_VIOLATIONS -gt 0 ]]; then
  VIOLATIONS=$((VIOLATIONS + CAT6_VIOLATIONS))
else
  echo "[OK] Category 6: No implementation-keyword greps in commands"
fi

# Category 7: verify-project-scope-strategy.sh hardcoded table names (artifact-driven)
# Dynamically discover table names from data-relationships.json and check none appear as literals
CAT7_FOUND=false
if [[ -f "$DATA_REL" ]]; then
  TABLE_NAMES=$(jq -r '.tables[].name' "$DATA_REL" 2>/dev/null || true)
  for table in $TABLE_NAMES; do
    # Check if table name appears as a string literal in select() or if statements
    if grep -qP "(select.*==.*\"$table\"|if.*==.*\"$table\")" "$REFERENCE"; then
      if [[ "$CAT7_FOUND" == "false" ]]; then
        echo "[X] Category 7: verify-project-scope-strategy.sh contains hardcoded table names"
        CAT7_FOUND=true
        VIOLATIONS=$((VIOLATIONS + 1))
      fi
      echo "  Found hardcoded table name: $table"
    fi
  done
fi
if [[ "$CAT7_FOUND" == "false" ]]; then
  echo "[OK] Category 7: No hardcoded table names in project-scope-strategy"
fi

# Category 8: verify-mvp-scope-boundaries.sh hardcoded platform resources (artifact-driven)
# Dynamically discover deferred resources from scope-manifest.json and check none appear as literals
CAT8_FOUND=false
if [[ -f "$SCOPE_MANIFEST" ]]; then
  DEFERRED=$(jq -r '.deferredResources[]?' "$SCOPE_MANIFEST" 2>/dev/null || true)
  for resource in $DEFERRED; do
    # Check if resource name appears as a string literal
    if grep -qP "\"$resource\"" "$REFERENCE"; then
      if [[ "$CAT8_FOUND" == "false" ]]; then
        echo "[X] Category 8: verify-mvp-scope-boundaries.sh contains hardcoded platform resources"
        CAT8_FOUND=true
        VIOLATIONS=$((VIOLATIONS + 1))
      fi
      echo "  Found hardcoded resource name: $resource"
    fi
  done
fi
if [[ "$CAT8_FOUND" == "false" ]]; then
  echo "[OK] Category 8: No hardcoded platform resources in mvp-scope-boundaries"
fi

# Category 9: Hardcoded health/auth paths in isolation gates (artifact-driven)
# Dynamically discover exception paths from scope-manifest.json and check none appear as literals
CAT9_FOUND=false
if [[ -f "$SCOPE_MANIFEST" ]]; then
  EXCEPTIONS=$(jq -r '.scopeExceptions[]?' "$SCOPE_MANIFEST" 2>/dev/null || true)
  for exception in $EXCEPTIONS; do
    # Check if exception path appears as a hardcoded string literal in conditions
    # But allow it in jq queries where it's being read from artifact
    if grep -qP "if.*==.*\"$exception\"|if.*=~.*\"$exception\"" "$REFERENCE"; then
      if [[ "$CAT9_FOUND" == "false" ]]; then
        echo "[X] Category 9: Hardcoded scope exception paths found in conditions"
        CAT9_FOUND=true
        VIOLATIONS=$((VIOLATIONS + 1))
      fi
      echo "  Found hardcoded exception path: $exception"
    fi
  done
fi
if [[ "$CAT9_FOUND" == "false" ]]; then
  echo "[OK] Category 9: No hardcoded scope exception paths in conditions"
fi

# Category 10: run-all-gates.sh unsanitized endpoint paths
# Check for raw ENDPOINT_PATH usage in gate IDs
if grep -qP 'endpoint-status-\$ENDPOINT_PATH' "$REFERENCE"; then
  echo "[X] Category 10: run-all-gates.sh uses unsanitized endpoint path in gate ID"
  grep -nP 'endpoint-status-\$ENDPOINT_PATH' "$REFERENCE"
  VIOLATIONS=$((VIOLATIONS + 1))
else
  echo "[OK] Category 10: Endpoint paths properly sanitized in run-all-gates"
fi

echo ""
if [[ $VIOLATIONS -gt 0 ]]; then
  echo "[FAIL] $VIOLATIONS hardcoding violation(s) found"
  echo "Fix ALL violations before proceeding to PRE-COMPLETION VERIFICATION"
  exit 1
else
  echo "[PASS] No hardcoding violations detected"
fi
```

**CRITICAL:** If ANY violation is found, Agent 6 MUST fix the offending script(s) and re-run the audit BEFORE declaring completion. Do not proceed to PRE-COMPLETION VERIFICATION until the hardcoding audit passes.

**HARD RULE:** Generated scripts MUST NOT contain any application-specific literal that appears anywhere in the input artifacts as a concrete value. If a value exists in an artifact, the script must read it from that artifact at runtime. The only exception is the "Acceptable hardcoded values" list above.

### Rule 8: Route Handler Pattern Validation

Gate scripts that verify endpoint implementation (e.g., verify-route-service-alignment.sh) SHOULD include validation for the critical anti-pattern where route handlers swallow all errors with generic 500 responses.

**Detection Pattern:**
```bash
# Scan route files for swallowing catch blocks
echo "=== Checking for error-swallowing anti-pattern ==="

VIOLATIONS=0
TOTAL_ROUTES=0

# Derive route files from service-contracts.json (never hardcode directory paths)
while read -r route_file; do
  if [[ -z "$route_file" || "$route_file" == "null" ]]; then
    continue
  fi
  
  if [[ ! -f "$route_file" ]]; then
    continue
  fi
  
  TOTAL_ROUTES=$((TOTAL_ROUTES + 1))
  
  # Detect catch blocks that return 500 without checking error type
  if grep -Pzo 'catch\s*\([^)]*\)\s*\{[^}]*res\.status\(500\)' "$route_file" > /dev/null 2>&1; then
    # Check if the catch block also checks error instanceof or error.name
    if ! grep -Pzo 'catch\s*\([^)]*\)\s*\{[^}]*(error\s+instanceof|error\.name|error\.status)' "$route_file" > /dev/null 2>&1; then
      echo "[X] WARNING: $route_file may contain error-swallowing catch block"
      echo "    Catch blocks must check error type before returning status codes"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  fi
done < <(jq -r '.endpoints[].routeFile' docs/service-contracts.json | sort -u)

if [ $VIOLATIONS -gt 0 ]; then
  THRESHOLD=$((TOTAL_ROUTES / 2))
  if [ $VIOLATIONS -gt $THRESHOLD ]; then
    echo "[X] FAIL: $VIOLATIONS of $TOTAL_ROUTES route files swallow service-layer HTTP status codes"
    echo "    This exceeds the 50% threshold -- widespread error-swallowing detected"
    echo "    See Agent 6 Error Response Standards - Anti-Pattern 4"
    FAIL=1
  else
    echo "[!] $VIOLATIONS route files may swallow service-layer HTTP status codes"
    echo "    See Agent 6 Error Response Standards - Anti-Pattern 4"
    echo "    This is a non-blocking warning but should be reviewed"
  fi
fi
```

**Note:** This is a heuristic check (uses grep pattern matching, not AST parsing) and may produce false positives for individual files. Individual hits are reported as warnings. However, if more than 50% of route handlers exhibit the anti-pattern, the check escalates to a blocking FAIL -- widespread error-swallowing indicates a systemic implementation flaw rather than an edge case.

---

## GATE DISCOVERY SOURCES

| Source Agent | Verification Scripts |
|--------------|---------------------|
| Agent 1 (scope) | verify-scope-invariants.sh, verify-complete-deferrals.sh |
| Agent 2 (architecture) | verify-env-manifest-schema.sh, verify-config-files-required.sh, verify-health-db-connectivity.sh, verify-no-wildcard-cors.sh, verify-encryption-binary.sh, verify-schema-imports.sh |
| Agent 3 (data model) | verify-cascade-completeness.sh, verify-project-scope-strategy.sh, verify-index-strategy.sh |
| Agent 4 (API contract) | verify-body-validation.sh, verify-upload-config-sourced.sh, verify-organisation-endpoint-naming.sh, verify-mvp-scope-boundaries.sh, verify-token-scoped-routing.sh |
| Agent 5 (UI spec) | verify-ui-canonical-paths.sh, verify-ui-api-alignment.sh, verify-ui-self-consistency.sh, verify-no-deferred-pages.sh |
| Agent 6 (internal) | verify-preflight-artifacts.sh, verify-no-forbidden-artifacts.sh, verify-spec-size-budget.sh, verify-no-placeholders.sh, verify-env-var-usage-proof.sh, verify-multi-tenant-isolation.sh, verify-error-handlers.sh, verify-endpoint-status.sh, verify-route-service-alignment.sh, verify-upload-e2e.sh, verify-pagination-max.sh, verify-status-enums.sh |

---

## SCRIPT-SPECIFIC GENERATION GUIDANCE

The following scripts require special generation logic beyond the standard rules above.

### verify-multi-tenant-isolation.sh

**EXACT IMPLEMENTATION REQUIRED** - This is NOT an example. Generate with scopeExceptions logic. Do NOT deviate.

This script verifies that authenticated endpoints for tenant-scoped entities include the isolation field in their routeArgs. It MUST cross-reference `data-relationships.json` to determine which entities are tenant-scoped, and MUST derive path exemptions from `scope-manifest.json`.

**PROHIBITED PATTERNS (will cause Rule 7 audit failure):**
```bash
# ❌ NEVER hardcode scope exception paths (e.g., health, auth endpoints)
if [[ "$ENDPOINT_PATH" == "<EXCEPTION_PATH>" ]]
if [[ "$ENDPOINT_PATH" == <EXCEPTION_PATTERN>/* ]]
if [[ "$path" =~ ^<EXCEPTION_PREFIX> ]]
```
**CRITICAL:** Never include any literal path that could appear in scope-manifest.json scopeExceptions. Rule 7 discovers actual paths dynamically from artifacts.

**REQUIRED IMPLEMENTATION LOGIC:**
1. Read `$ISOLATION_FIELD` from `docs/scope-manifest.json` (per Rule 6). If empty, skip entirely.
2. **Extract scope exceptions from `docs/scope-manifest.json` scopeExceptions array** - DO NOT hardcode any exception paths.
3. For each endpoint in `docs/service-contracts.json` where `mustUseAuth == true`:
   a. **Check if the endpoint path matches any scope exception pattern. If yes, skip validation.**
   b. Derive the entity name from the endpoint path (e.g., `/api/projects` -> `projects`).
   c. Look up the entity's `tenantKey` in `docs/data-relationships.json`.
   d. If `tenantKey` is `"none"` (platform-level entity), **skip** this endpoint -- it is intentionally accessible across tenants.
   e. If `tenantKey` is `"direct"`, verify the endpoint's `routeArgs` contain a reference to `$ISOLATION_FIELD`.
   f. If `tenantKey` is `"indirect"`, verify the endpoint uses project-scoping middleware instead.
4. Use `$ISOLATION_FIELD` variable throughout -- never hardcode the field name (Rule 6, Category 1).

**REQUIRED scopeExceptions extraction pattern:**
```bash
# Extract scope exceptions from scope-manifest.json
SCOPE_EXCEPTIONS=$(jq -r '.scopeExceptions[]? // empty' "$SCOPE_MANIFEST")

# For each endpoint, check if it matches any exception before validating
SKIP_ENDPOINT=false
if [[ -n "$SCOPE_EXCEPTIONS" ]]; then
  while IFS= read -r exception_pattern; do
    if [[ "$ENDPOINT_PATH" == $exception_pattern ]]; then
      SKIP_ENDPOINT=true
      echo "[SKIP] $ENDPOINT_PATH (scope exception: $exception_pattern)"
      break
    fi
  done <<< "$SCOPE_EXCEPTIONS"
fi

if [[ "$SKIP_ENDPOINT" == "true" ]]; then
  continue  # Skip to next endpoint
fi
```

**Why this matters:** Without the tenantKey cross-reference, the gate falsely fails on endpoints for platform-level entities (e.g., canonical schemas, system config) that legitimately do not filter by tenant. Without scope exception derivation, changes to health/auth routing require updates to the gate script itself rather than the scope manifest.

**Enforcement:** Rule 7 audit will grep for `/health`, `/api/auth` as string literals in this script and FAIL if found.

### verify-token-scoped-routing.sh

**EXACT IMPLEMENTATION REQUIRED** - This is NOT an example. Generate this script with this exact logic. Do NOT deviate.

This script verifies that organisation-scoped endpoints filter by the configured isolation field. It MUST derive path exemptions from `scope-manifest.json` rather than hardcoding health/auth patterns.

**PROHIBITED PATTERNS (will cause Rule 7 audit failure):**
```bash
# ❌ NEVER hardcode scope exception paths (e.g., health, auth endpoints)
if [[ "$ENDPOINT_PATH" == "<EXCEPTION_PATH>" ]]
if [[ "$ENDPOINT_PATH" == <EXCEPTION_PATTERN>/* ]]

# ❌ NEVER hardcode the isolation field name anywhere (including comments)
# Phase 4: Verify organisation-scoped endpoints use req.user.<ISOLATION_FIELD>
echo "Checking <ISOLATION_FIELD> scoping"
```
**CRITICAL:** Never include any literal path from scopeExceptions or field name that could appear in artifacts. Rule 7 discovers them dynamically.

**REQUIRED IMPLEMENTATION:**
```bash
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
# CRITICAL: Use correct path .platformConstraints.multiTenancy.isolationField
ISOLATION_FIELD=$(jq -r '.platformConstraints.multiTenancy.isolationField // empty' "$SCOPE_MANIFEST")

if [[ -z "$ISOLATION_FIELD" ]]; then
  echo "[SKIP] No tenant isolation configured"
  exit 0
fi

# Extract scope exceptions (health, auth endpoints) from scope-manifest.json
# DO NOT hardcode paths like "/health" or "/api/auth/*"
SCOPE_EXCEPTIONS=$(jq -r '.scopeExceptions[]? // empty' "$SCOPE_MANIFEST")

echo "Checking $ISOLATION_FIELD scoping for org-scoped endpoints"
if [[ -n "$SCOPE_EXCEPTIONS" ]]; then
  echo "Scope exceptions:"
  echo "$SCOPE_EXCEPTIONS" | sed 's/^/  - /'
fi

# Check each authenticated endpoint
while IFS= read -r endpoint_path; do
  # Skip if path matches any exception pattern (glob-style matching)
  SKIP_ENDPOINT=false
  if [[ -n "$SCOPE_EXCEPTIONS" ]]; then
    while IFS= read -r exception_pattern; do
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
  # Use --arg for safe string interpolation (handles quotes/backslashes)
  ROUTE_ARGS=$(jq -r --arg p "$endpoint_path" '.endpoints[] | select(.path == $p) | .routeArgs[]?' "$SERVICE_CONTRACTS")
  
  if ! echo "$ROUTE_ARGS" | grep -q "$ISOLATION_FIELD"; then
    echo "[X] $endpoint_path: Missing $ISOLATION_FIELD in routeArgs"
    FAIL=1
  else
    echo "[OK] $endpoint_path: $ISOLATION_FIELD scoping present"
  fi
done < <(jq -r '.endpoints[] | select(.mustUseAuth == true) | .path' "$SERVICE_CONTRACTS")

exit $FAIL
```

**Why this matters:** Hardcoding health/auth path patterns makes the gate fragile to changes in routing structure. Path exemptions should be declared in scope-manifest.json as a configurable list. Using glob-style `==` matching ensures `/api/auth/*` patterns work correctly. The isolation field path MUST match the framework standard `.platformConstraints.multiTenancy.isolationField`.

**Enforcement:** Rule 7 audit will grep for `/health`, `/api/auth`, `organisationId` as string literals in this script and FAIL if found.

### run-all-gates.sh: Endpoint Path Sanitization

**MANDATORY PATTERN** - When generating per-endpoint gates, endpoint paths MUST be sanitized to create valid gate identifiers.

**PROHIBITED PATTERN (will cause Rule 7 audit failure):**
```bash
# ❌ NEVER use raw endpoint path in gate ID
run_gate "endpoint-status-$ENDPOINT_PATH" "$SCRIPT_DIR/verify-endpoint-status.sh" "$i"
```

**REQUIRED PATTERN:**
```bash
# Sanitize endpoint path for use in gate ID
# Replace / with -, remove leading/trailing -, strip special characters
GATE_ID=$(echo "$ENDPOINT_PATH" | sed 's|^/||; s|/$||; s|/|-|g; s|[^a-zA-Z0-9_-]||g')

# Use sanitized ID in gate name
run_gate "endpoint-status-$GATE_ID" "$SCRIPT_DIR/verify-endpoint-status.sh" "$i"
```

**Example transformations:**
- `/api/users` → `api-users`
- `/api/users/{id}` → `api-users-id`
- `/api/auth/login` → `api-auth-login`

**Why this matters:** Endpoint paths may contain special characters (slashes, braces, colons, unusual UTF-8) that break JSON formatting or shell parsing. Sanitization prevents edge case failures and keeps gate names consistent.

**Enforcement:** Rule 7 audit will grep for `"endpoint-status-$ENDPOINT_PATH"` in run-all-gates.sh and FAIL if found (must use `$GATE_ID` instead).

### verify-schema-imports.sh

This script verifies that TypeScript schema files under `server/db/schema/` do not use `.js` extensions in relative imports.

**Critical logic:**
```bash
#!/bin/bash
set -euo pipefail
echo "=== verify-schema-imports ==="

SCHEMA_DIR="server/db/schema"
FAIL=0

if [[ ! -d "$SCHEMA_DIR" ]]; then
  echo "[SKIP] No schema directory found at $SCHEMA_DIR"
  exit 0
fi

# Check for .js extensions in relative imports (breaks drizzle-kit CJS resolution)
while IFS= read -r file; do
  if grep -Pn "from\s+['\"]\..*\.js['\"]" "$file" > /dev/null 2>&1; then
    echo "[X] FAIL: $file contains .js extension in relative import"
    grep -Pn "from\s+['\"]\..*\.js['\"]" "$file"
    FAIL=1
  fi
done < <(find "$SCHEMA_DIR" -name "*.ts" -type f)

if [[ $FAIL -eq 0 ]]; then
  echo "[OK] No .js extensions found in schema imports"
fi
exit $FAIL
```

**Why this matters:** TypeScript schema files with `.js` import extensions cause `drizzle-kit push` to fail when running in CJS mode. The `.js` extension is a common ESM convention that breaks CJS resolution.

### verify-error-handlers.sh

This script verifies that the Express application entry file includes the required error handling middleware stack.

**Critical logic:**
```bash
#!/bin/bash
set -euo pipefail
echo "=== verify-error-handlers ==="

FAIL=0

# Find Express entry file (look for app.listen or createServer)
# Derive server directory from service-contracts.json (never hardcode "server")
SERVER_DIR=$(jq -r '.endpoints[0].routeFile // empty' "$SERVICE_CONTRACTS" | sed 's|/.*||')
if [[ -z "$SERVER_DIR" ]]; then
  echo "[X] FAIL: Cannot derive server directory from service-contracts.json"
  exit 1
fi

ENTRY_FILE=$(find "$SERVER_DIR" -name "*.ts" -type f -exec grep -l "app\.listen\|createServer" {} \; | head -1)

if [[ -z "$ENTRY_FILE" ]]; then
  echo "[X] FAIL: Cannot find Express entry file"
  exit 1
fi

echo "Checking Express entry file: $ENTRY_FILE"

# Check 1: JSON body parser with error handling
if ! grep -q "express\.json\|bodyParser\.json\|express\.urlencoded" "$ENTRY_FILE"; then
  echo "[X] FAIL: No JSON body parser found in $ENTRY_FILE"
  FAIL=1
else
  echo "[OK] JSON body parser found"
fi

# Check 2: Global error handler (4-parameter middleware: err, req, res, next)
if ! grep -Pzo '(err|error)\s*,\s*(req|request)\s*,\s*(res|response)\s*,\s*(next)' "$ENTRY_FILE" > /dev/null 2>&1; then
  echo "[X] FAIL: No global error handler (4-param middleware) found in $ENTRY_FILE"
  FAIL=1
else
  echo "[OK] Global error handler found"
fi

# Runtime validation intentionally skipped to avoid hardcoded endpoint paths
# Static checks for body parser and error handler middleware are sufficient

if [[ $FAIL -eq 0 ]]; then
  echo "[OK] Error handler verification passed"
fi
exit $FAIL
```

**Why this matters:** Without a JSON parse error handler, malformed request bodies produce HTML stack traces instead of JSON 400 responses. Without a global error handler, unhandled exceptions crash the process. Both are mandatory middleware components. Runtime validation is skipped to avoid hardcoding application-specific endpoint paths.

### verify-project-scope-strategy.sh

**EXACT IMPLEMENTATION REQUIRED** - This is NOT an example. Generate this script with this exact logic. Do NOT deviate.

This script verifies that entities with indirect tenant scoping (tenantKey: "indirect") have a documented project-scoping strategy. It MUST dynamically discover which entities require this validation from `data-relationships.json`.

**PROHIBITED PATTERNS (will cause Rule 7 audit failure):**
```bash
# ❌ NEVER hardcode table names
if [[ "$TABLE_NAME" == "<TABLE_NAME>" ]]
if [[ "$TABLE_NAME" == "<ANOTHER_TABLE>" ]]

# ❌ NEVER use hardcoded lists
INDIRECT_TABLES=("<TABLE_1>" "<TABLE_2>")
```
**CRITICAL:** Never include any literal table name that could appear in data-relationships.json. Rule 7 discovers actual table names dynamically from artifacts.

**REQUIRED IMPLEMENTATION:**
```bash
#!/bin/bash
set -euo pipefail
echo "=== verify-project-scope-strategy ==="

DATA_REL="docs/data-relationships.json"
FAIL=0

if [[ ! -f "$DATA_REL" ]]; then
  echo "[SKIP] data-relationships.json not found"
  exit 0
fi

# Dynamically discover entities with indirect tenant scoping
# DO NOT hardcode table names - read from artifact at runtime
INDIRECT_ENTITIES=$(jq -r '.tables[] | select(.tenantKey == "indirect") | .name' "$DATA_REL")

if [[ -z "$INDIRECT_ENTITIES" ]]; then
  echo "[OK] No indirect-tenant entities found"
  exit 0
fi

echo "Found indirect-tenant entities:"
echo "$INDIRECT_ENTITIES" | sed 's/^/  - /'

# Verify each indirect entity has a scoping strategy
while IFS= read -r entity; do
  if [[ -z "$entity" ]]; then
    continue
  fi
  
  # Check if entity has projectScopeStrategy field
  STRATEGY=$(jq -r ".tables[] | select(.name == \"$entity\") | .projectScopeStrategy // empty" "$DATA_REL")
  
  if [[ -z "$STRATEGY" ]]; then
    echo "[X] FAIL: $entity has tenantKey:indirect but no projectScopeStrategy"
    FAIL=1
  else
    echo "[OK] $entity: projectScopeStrategy = $STRATEGY"
  fi
done <<< "$INDIRECT_ENTITIES"

exit $FAIL
```

**Why this matters:** Hardcoding entity names like "processingJobs" makes the gate fail on applications that don't have those entities. The gate must discover which entities need validation at runtime by reading the data model.

**Enforcement:** Rule 7 audit will grep for `"processingJobs"`, `"datasets"`, `"projectDataSources"` in this script and FAIL if found.

### verify-mvp-scope-boundaries.sh

**EXACT IMPLEMENTATION REQUIRED** - This is NOT an example. Generate this script with this exact logic. Do NOT deviate.

This script verifies that platform resources deferred to post-MVP are documented in scope-manifest.json. It MUST extract the deferred resources dynamically from the artifact.

**PROHIBITED PATTERNS (will cause Rule 7 audit failure):**
```bash
# ❌ NEVER hardcode platform resource names
PLATFORM_RESOURCES=("<RESOURCE_NAME>" "<ANOTHER_RESOURCE>")
if [[ "$resource" == "<RESOURCE_NAME>" ]]
```
**CRITICAL:** Never include any literal resource name that could appear in scope-manifest.json deferredResources. Rule 7 discovers them dynamically.

**REQUIRED IMPLEMENTATION:**
```bash
#!/bin/bash
set -euo pipefail
echo "=== verify-mvp-scope-boundaries ==="

SCOPE_MANIFEST="docs/scope-manifest.json"
SERVICE_CONTRACTS="docs/service-contracts.json"
FAIL=0

if [[ ! -f "$SCOPE_MANIFEST" ]] || [[ ! -f "$SERVICE_CONTRACTS" ]]; then
  echo "[SKIP] Required artifacts not found"
  exit 0
fi

# Extract deferred resources from scope-manifest.json
# DO NOT hardcode resource names - read from artifact at runtime
DEFERRED_RESOURCES=$(jq -r '.deferredResources[]? // empty' "$SCOPE_MANIFEST")

if [[ -z "$DEFERRED_RESOURCES" ]]; then
  echo "[OK] No deferred platform resources declared"
  exit 0
fi

echo "Deferred platform resources:"
echo "$DEFERRED_RESOURCES" | sed 's/^/  - /'

# Check that deferred resources do not have endpoints defined
# Use loose substring matching (not pluralization heuristic) to detect potential violations
while IFS= read -r resource; do
  if [[ -z "$resource" ]]; then
    continue
  fi
  
  # Check if any endpoint path contains the resource name as a substring
  # This is a warning-level check, not blocking, since URL structure varies
  MATCHING_ENDPOINTS=$(jq -r --arg r "$resource" '.endpoints[] | select(.path | contains($r)) | .path' "$SERVICE_CONTRACTS" 2>/dev/null || true)
  
  if [[ -n "$MATCHING_ENDPOINTS" ]]; then
    echo "[!] WARNING: Deferred resource '$resource' may have related endpoints:"
    echo "$MATCHING_ENDPOINTS" | sed 's/^/    /'
    echo "    Verify these endpoints are intentionally in MVP scope"
    # Not FAIL - just warn since URL patterns vary across applications
  else
    echo "[OK] $resource: No matching endpoint paths found"
  fi
done <<< "$DEFERRED_RESOURCES"

exit $FAIL
```

**Why this matters:** Hardcoding platform resource names makes the gate fail on applications with different platform architectures. The gate must read deferred resources from scope-manifest.json. The substring matching approach (vs pluralization heuristic) is more robust across different URL structures while still flagging potential scope violations for manual review.

**Enforcement:** Rule 7 audit will check that no resource names from scope-manifest.json appear as hardcoded literals in this script.

---

## REACHING 99+ GATES: PER-ENTITY EXPANSION

The structural gates above are the framework's fixed checks. To reach 99+ total gates, the `run-all-gates.sh` script MUST also generate **per-entity expansion gates** by iterating over the JSON artifacts:

| Expansion Source | Gate Generated Per... | Example |
|------------------|-----------------------|---------|
| service-contracts.json | Each required endpoint | "POST /api/auth/login route file exists" |
| data-relationships.json | Each cascade parent | "organisations cascade targets complete" |
| data-relationships.json | Each indirect-tenant table | "processingJobs has projectScopeStrategy" |
| env-manifest.json | Each required env var | "DATABASE_URL declared with 6 fields" |
| ui-api-deps.json | Each required page | "LoginPage.tsx exists and has valid API calls" |

---

## DYNAMIC GATE EXPANSION PATTERNS (ALL GUARDED)

When generating per-item expansion gates in run-all-gates.sh, use these patterns with guards:

### Pattern 1: Per-Table Gates

```bash
DATA_REL="$PROJECT_ROOT/docs/data-relationships.json"
if [[ -f "$DATA_REL" ]]; then
  TABLE_COUNT=$(jq '.tables | length' "$DATA_REL")
  if [[ $TABLE_COUNT -gt 0 ]]; then
    for i in $(seq 0 $((TABLE_COUNT - 1))); do
      TABLE_NAME=$(jq -r ".tables[$i].name" "$DATA_REL")
      # ... gate logic ...
    done
  fi
fi
```

### Pattern 2: Per-Endpoint Gates

```bash
SERVICE_CONTRACTS="$PROJECT_ROOT/docs/service-contracts.json"
if [[ -f "$SERVICE_CONTRACTS" ]]; then
  ENDPOINT_COUNT=$(jq '.endpoints | length' "$SERVICE_CONTRACTS")
  if [[ $ENDPOINT_COUNT -gt 0 ]]; then
    for i in $(seq 0 $((ENDPOINT_COUNT - 1))); do
      endpoint_path=$(jq -r ".endpoints[$i].path" "$SERVICE_CONTRACTS")
      # ... gate logic ...
    done
  fi
fi
```

### Pattern 3: Per-Page Gates

```bash
UI_DEPS="$PROJECT_ROOT/docs/ui-api-deps.json"
if [[ -f "$UI_DEPS" ]]; then
  PAGE_COUNT=$(jq '.pages | length' "$UI_DEPS")
  if [[ $PAGE_COUNT -gt 0 ]]; then
    for i in $(seq 0 $((PAGE_COUNT - 1))); do
      ROUTE_PATH=$(jq -r ".pages[$i].routePath" "$UI_DEPS")
      # ... gate logic ...
    done
  fi
fi
```

---

## BUILD TRANSCRIPT TEMPLATE

Agent 6 MUST generate `docs/build-transcript.md` as a template:

```markdown
# Build Transcript

> **Template generated by Agent 6.** This file is populated with actual results when `scripts/run-all-gates.sh` executes after implementation.

## Execution Results

| Metric | Value |
|--------|-------|
| Build ID | GENERATED_AT_RUNTIME |
| Start Time | GENERATED_AT_RUNTIME |
| End Time | GENERATED_AT_RUNTIME |
| Total Gates | GENERATED_AT_RUNTIME |
| Passed | GENERATED_AT_RUNTIME |
| Failed | GENERATED_AT_RUNTIME |

> Populated by `scripts/run-all-gates.sh` - see `docs/build-gate-results.json` for structured results.

**Status:** TEMPLATE - Awaiting gate execution

---

## Script Extraction

Before implementation, run:
```bash
bash docs/gate-splitter.sh
```

This extracts 33 individual scripts from `docs/gate-scripts-reference.md`.

---

## Gate Inventory

**Expected:** 99+ gates (33 structural + per-entity expansion)

### Structural Gates (33 scripts)

See MANDATORY SCRIPTS LIST in agent-6-implementation-orchestrator.md

### Per-Entity Expansion Gates

Generated dynamically from JSON artifacts at runtime.
```

---

## BUILD GATE RESULTS TEMPLATE

Agent 6 MUST generate `docs/build-gate-results.json` as a template:

```json
{
  "$schema": "build-gate-results-v1",
  "buildId": "GENERATED_AT_RUNTIME",
  "startTime": "GENERATED_AT_RUNTIME",
  "endTime": "GENERATED_AT_RUNTIME",
  "summary": {
    "total": 0,
    "passed": 0,
    "failed": 0
  },
  "gates": [],
  "_note": "This is a template. Actual results are written by scripts/run-all-gates.sh"
}
```

---

## BUILD EXECUTION ORDER

**Agent 6 completes Steps 1-5 only. Steps 6-12 are executed by Claude Code.**

```
Step 1: Generate docs/gate-scripts-reference.md (Agent 6)
Step 2: Generate docs/gate-splitter.sh (Agent 6)
Step 3: Generate docs/build-gate-results.json + docs/build-transcript.md templates (Agent 6)
Step 4: Run RULE 7 POST-GENERATION HARDCODING AUDIT (Agent 6 self-check)
Step 5: Run PRE-COMPLETION STRUCTURAL VERIFICATION (Agent 6 self-check)
--- AGENT 6 STOPS HERE ---
Step 6: Claude Code runs: bash docs/gate-splitter.sh (extracts 33 scripts)
Step 7: Claude Code verifies: ls scripts/*.sh | wc -l (should equal 33)
Step 8: Claude Code implements application code phase by phase
Step 9: Claude Code executes: bash scripts/run-all-gates.sh
Step 10: If any gate FAILS -> Claude Code fixes and re-runs
Step 11: Claude Code validates build proof
Step 12: run-all-gates.sh updates docs/build-transcript.md with actual results
```

**CRITICAL:** Agent 6 produces documentation only. Claude Code extracts scripts and implements code.

---

## GATE EXECUTION REQUIREMENTS

1. `scripts/run-all-gates.sh` is EXTRACTED from `docs/gate-scripts-reference.md` by `gate-splitter.sh`
2. MUST use `set -euo pipefail`
3. MUST produce `docs/build-gate-results.json` with `"$schema": "build-gate-results-v1"`
4. MUST include 99+ total gates (structural + expansion)
5. MUST exit non-zero on any gate failure
6. MUST follow SCRIPT GENERATION RULES
7. MUST include the split-first guard (see below)

### Split-First Guard (MANDATORY in run-all-gates.sh)

The orchestrator MUST verify that scripts have been extracted before attempting to run them. Include this guard at the top of `run-all-gates.sh`:

```bash
# Split-first guard - ensure gate-splitter.sh has been run
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXPECTED_VERIFY_SCRIPTS=32

ACTUAL_VERIFY_SCRIPTS=$(ls -1 "$SCRIPT_DIR"/verify-*.sh 2>/dev/null | wc -l)
if [[ $ACTUAL_VERIFY_SCRIPTS -lt $EXPECTED_VERIFY_SCRIPTS ]]; then
  echo "[X] ERROR: Found $ACTUAL_VERIFY_SCRIPTS verify scripts, expected $EXPECTED_VERIFY_SCRIPTS"
  echo ""
  echo "    Scripts have not been extracted. Run this first:"
  echo "    bash docs/gate-splitter.sh"
  echo ""
  exit 1
fi
```

This prevents cryptic "script not found" errors if someone runs the orchestrator before extraction.

---

## DOWNSTREAM HANDOFF

**To Master Build Prompt:**
- docs/gate-scripts-reference.md contains all scripts
- docs/gate-splitter.sh ready to extract
- Templates ready for population

**To Agent 7 (QA):**
- Build proof must exist before QA begins

**To Agent 8 (Code Review):**
- Build proof is a hard blocker for audit


## Implementation Phases

The implementation process follows a strict two-phase sequence to ensure infrastructure exists before population begins.

### Phase 1: Infrastructure Scaffolding

**Objective**: Establish complete project structure with all directories and skeleton files.

**Deliverables**:
- All directory structures created per Architecture Specification
- Database schema files created (empty or with base structure)
- Service class files created (with class declarations and method stubs)
- Route files created (with router setup and endpoint stubs)
- Component files created (with component declarations and prop interfaces)
- Configuration files created (environment templates, build configs)

**Verification Gate**:
```bash
# WARNING: DO NOT copy these hardcoded paths into production gates!
# These are ILLUSTRATIVE placeholders only.
# 
# In production gates, ALWAYS derive directories from artifacts.
# See Rule 6 Category 4 REPLACEMENT PATTERNS for correct approach:
#
# SEARCH_DIRS=()
# for artifact in docs/service-contracts.json docs/ui-api-deps.json ...; do
#   while IFS= read -r dir; do
#     SEARCH_DIRS+=("$dir")
#   done < <(grep -oP '"[^"]*\.(ts|tsx)"' "$artifact" | tr -d '"' | sed 's|/.*||' | sort -u)
# done
#
# Then: find "${SEARCH_DIRS[@]}" -type f -name "*.ts" | wc -l

# Verify file count matches orchestration plan (using derived directories)
# Verify file count matches UI specification (using derived directories)
```

**Completion Criteria**: Every file referenced in the implementation plan exists on disk. No file should be fully implemented yet.

---

### Phase 2: Component Population

**Objective**: Implement full logic within the established infrastructure.

**Sequence**:
1. **Database Layer**: Populate schema files with complete table definitions, relationships, and indices
2. **Service Layer**: Implement business logic, validation, and data access methods
3. **API Layer**: Implement route handlers with request validation and response formatting
4. **UI Layer**: Implement components with state management, event handlers, and styling

**Verification**: After each layer completes, run layer-specific tests before proceeding.

**Completion Criteria**: All components fully implemented per specification. All verification scripts pass.

---

### Phase Gate Enforcement

**Critical Rule**: Phase 2 cannot begin until Phase 1 verification passes.

**Rationale**: Attempting to populate files before they exist triggers read-before-write errors. Attempting to create files that already exist triggers overwrite conflicts. The phase gate eliminates both failure modes.

**Recovery Protocol**: If phase verification fails:
1. Identify missing or malformed files from verification output
2. Complete Phase 1 for those files only
3. Re-run verification
4. Proceed to Phase 2 only after full pass

---

## Error Response Standards

**REFERENCE ONLY:** This section provides context for gate scripts to validate error handling patterns. It is NOT application code to be generated by Agent 6.

All API errors must return appropriate HTTP status codes with consistent JSON structure. The framework distinguishes between client errors (4xx) and server errors (5xx).

### HTTP Status Code Standards

**Client Errors (4xx)** - Invalid requests, authentication, or authorization:
- `400 Bad Request` - Malformed JSON, invalid data types, missing required fields
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Authenticated but insufficient permissions
- `404 Not Found` - Resource does not exist
- `409 Conflict` - Request conflicts with current state (e.g., duplicate email)
- `413 Payload Too Large` - Request body exceeds size limit
- `422 Unprocessable Entity` - Valid JSON but semantic validation fails

**Server Errors (5xx)** - Service failures:
- `500 Internal Server Error` - Unexpected server error
- `503 Service Unavailable` - Database or external service unavailable

**Critical Rule**: Validation errors, malformed input, and invalid parameters must return 4xx, not 5xx. A 500 error indicates a bug in the application code, not a problem with the request.

---

## Mandatory Middleware Stack

**REFERENCE ONLY:** This section documents expected middleware patterns that gate scripts should validate. It is NOT application code to be generated by Agent 6.

All Express applications must implement this middleware stack in order:

### 1. Body Parser Middleware

**Purpose**: Parse JSON request bodies and validate content type

```typescript
// server/index.ts
import express from 'express';
const app = express();

// JSON body parser with size limit
app.use(express.json({ limit: '10mb' }));

// Ensure body is an object for POST/PATCH/PUT requests
app.use((req, res, next) => {
  if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
    if (req.body === null || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ 
        error: 'Request body must be a valid JSON object' 
      });
    }
  }
  next();
});
```

---

### 2. Parameter Validation Middleware

**Purpose**: Validate UUID parameters before reaching route handlers

```typescript
// server/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { validate as uuidValidate } from 'uuid';

export const validateParams = (paramNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const paramName of paramNames) {
      const value = req.params[paramName];
      
      if (!value) {
        return res.status(400).json({ 
          error: `Missing required parameter: ${paramName}` 
        });
      }
      
      // Validate UUIDs
      if (paramName.endsWith('Id') && !uuidValidate(value)) {
        return res.status(400).json({ 
          error: `Invalid ${paramName}: must be a valid UUID` 
        });
      }
    }
    
    next();
  };
};
```

**Usage in Routes**:
```typescript
// server/routes/users.routes.ts
import { validateParams } from '../middleware/validate';

// Validate userId parameter
router.get('/:userId', 
  authenticate, 
  validateParams(['userId']), 
  async (req, res) => {
    // userId is guaranteed to be a valid UUID
    const user = await userService.getById(req.params.userId);
    res.json(user);
  }
);

// Validate projectId and dataSourceId
router.post('/:projectId/data-sources/:dataSourceId/process',
  authenticate,
  validateParams(['projectId', 'dataSourceId']),
  async (req, res) => {
    // Both IDs are valid UUIDs
  }
);
```

---

### 3. Project Access Validation Middleware

**Purpose**: Validate project ownership before allowing access

```typescript
// server/middleware/validate.ts (continued)
export const validateProjectAccess = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const projectId = req.params.projectId;
  const user = req.user; // Set by authenticate middleware
  
  if (!projectId) {
    return res.status(400).json({ error: 'Missing projectId parameter' });
  }
  
  if (!uuidValidate(projectId)) {
    return res.status(400).json({ error: 'Invalid projectId: must be a valid UUID' });
  }
  
  try {
    const project = await db
      .select()
      .from(projects)
      .where(and(
        eq(projects.id, projectId),
        eq(projects.organisationId, user.organisationId),
        isNull(projects.deletedAt)
      ))
      .limit(1);
    
    if (project.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    req.project = project[0];
    next();
  } catch (error) {
    // Database errors are 500, not 400
    next(error);
  }
};
```

**Usage**:
```typescript
// All project-scoped routes use this middleware
router.get('/:projectId/data-sources',
  authenticate,
  validateProjectAccess,
  async (req, res) => {
    // req.project is guaranteed to exist and belong to user's org
  }
);
```

---

### 4. Global Error Handler

**Purpose**: Catch all unhandled errors and return appropriate responses

**Position**: Must be the last middleware in the stack

```typescript
// server/index.ts (after all routes)

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  
  // Database connection errors
  if (err.message.includes('ECONNREFUSED') || err.message.includes('database')) {
    return res.status(503).json({ 
      error: 'Service temporarily unavailable',
      message: 'Database connection failed'
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      error: 'Invalid or expired token' 
    });
  }
  
  // Validation errors (from Zod or similar)
  if (err.name === 'ZodError') {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: err
    });
  }
  
  // Default server error
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
```

---

## Route Handler Error Patterns

All route handlers must use try-catch and return appropriate status codes.

### Correct Pattern

```typescript
router.post('/:projectId/data-sources',
  authenticate,
  validateProjectAccess,
  async (req, res) => {
    try {
      // Service layer throws semantic errors
      const dataSource = await dataSourceService.create(
        req.params.projectId,
        req.body
      );
      
      res.status(201).json(dataSource);
    } catch (error) {
      // Distinguish between client and server errors
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      
      if (error instanceof ConflictError) {
        return res.status(409).json({ error: error.message });
      }
      
      // Unknown errors go to global handler
      throw error;
    }
  }
);
```

### Incorrect Patterns

**Anti-Pattern 1**: Returning 500 for validation errors
```typescript
// [X] Wrong
try {
  const dataSource = await dataSourceService.create(projectId, req.body);
} catch (error) {
  res.status(500).json({ error: error.message });  // Should be 400
}
```

**Anti-Pattern 2**: Not validating parameters
```typescript
// [X] Wrong - allows invalid UUIDs to reach database
router.get('/:userId', async (req, res) => {
  const user = await db.select().from(users).where(eq(users.id, req.params.userId));
  // Database will throw error on invalid UUID, returning 500 instead of 400
});
```

**Anti-Pattern 3**: Not using middleware
```typescript
// [X] Wrong - duplicates validation logic in every handler
router.get('/:userId', async (req, res) => {
  if (!uuidValidate(req.params.userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }
  // Validation repeated in every route
});

// [OK] Correct - middleware handles it once
router.get('/:userId', validateParams(['userId']), async (req, res) => {
  // userId is already validated
});
```

**Anti-Pattern 4**: Swallowing all errors with generic 500 (CRITICAL)
```typescript
// [X] CRITICAL ANTI-PATTERN - DO NOT GENERATE THIS
router.post('/:projectId/data-sources',
  authenticate,
  validateProjectAccess,
  async (req, res) => {
    try {
      const dataSource = await dataSourceService.create(
        req.params.projectId,
        req.body
      );
      res.status(201).json(dataSource);
    } catch (error) {
      // [X] This swallows all service-layer status codes
      res.status(500).json({ error: 'Failed to create data source' });
    }
  }
);
```

**Why this is critical:** Service layers throw errors with specific HTTP status codes (400, 403, 404, 409) using custom error classes (ValidationError, NotFoundError, ConflictError). When route handlers catch everything and return 500, clients receive "Internal Server Error" for validation failures and not-found conditions. This violates HTTP semantics and breaks client error handling.

**Correct pattern:** Route handlers must either:
1. Check error types explicitly and return appropriate status codes (see "Correct Pattern" above)
2. Re-throw unknown errors to let the global error handler process them (preferred for errors with .status property)
3. Not use try-catch at all if middleware and global handler are sufficient

---

## Service Layer Error Classes

Define custom error classes to distinguish error types:

```typescript
// server/lib/errors.ts
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
```

**Service Layer Usage**:
```typescript
// server/services/UserService.ts
export class UserService {
  async getById(userId: string) {
    const user = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (user.length === 0) {
      throw new NotFoundError('User', userId);
    }
    
    return user[0];
  }
  
  async create(data: CreateUserInput) {
    // Check for existing email
    const existing = await db.select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);
    
    if (existing.length > 0) {
      throw new ConflictError('User with this email already exists');
    }
    
    // Validation
    if (!data.password || data.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
    
    return await db.insert(users).values(data).returning();
  }
}
```

---

## QA Test Expectations

The `qa-input-validation.sh` script verifies that:
1. Malformed JSON returns 400 (not 500)
2. Invalid parameter types return 400 (not 500)
3. Invalid UUIDs return 400 (not 500)
4. Missing required fields return 400 (not 500)

**Test Cases**:
```bash
# Malformed JSON
curl -X POST /api/projects -d "not json" -> 400

# Invalid UUID
curl -X GET /api/users/not-a-uuid -> 400

# Wrong body type (array instead of object)
curl -X POST /api/projects -d "[]" -> 400

# Missing required fields
curl -X POST /api/projects -d "{}" -> 400
```

---

---

## PROMPT HYGIENE GATE

- [OK] Version Reference block present with Linked Documents (Section Y compliant)
- [OK] No dependency version pins outside VERSION HISTORY
- [OK] SCOPE BOUNDARY section (Agent 6 does NOT write application code)
- [OK] FILE OUTPUT MANIFEST: 4 files (was 26+)
- [OK] SPLITTABLE FORMAT SPECIFICATION with delimiter rules and strict content rules
- [OK] Content rules: FILE blocks only, no catalogue snippets allowed
- [OK] GATE SPLITTER UTILITY with duplicate detection and post-split verification
- [OK] MANDATORY SCRIPTS LIST (33 scripts: 1 orchestrator + 32 verification)
- [OK] PREFLIGHT SCOPE clarified (5 spec JSONs + reference.md only, NOT build outputs)
- [OK] PRE-COMPLETION VERIFICATION checks markers, not individual files (expects 33 markers)
- [OK] SCRIPT GENERATION RULES (8 rules: Rules 1-5 structural, Rule 6 application-agnostic with BANNED PATTERNS table + REPLACEMENT PATTERNS, Rule 7 post-generation hardcoding audit with Categories 1-10 [Cat 6 constrained to actual grep commands, Cats 7-9 artifact-driven dynamic discovery], Rule 8 anti-pattern 4 with threshold escalation)
- [OK] SCRIPT-SPECIFIC GENERATION GUIDANCE marked as EXACT IMPLEMENTATION REQUIRED: verify-multi-tenant-isolation.sh (with scopeExceptions derivation + glob-style matching + PROHIBITED PATTERNS), verify-schema-imports.sh, verify-error-handlers.sh (static checks only, runtime validation skipped to avoid hardcoded paths), verify-project-scope-strategy.sh (dynamic entity discovery + PROHIBITED PATTERNS), verify-mvp-scope-boundaries.sh (dynamic resource extraction + PROHIBITED PATTERNS), verify-token-scoped-routing.sh (scopeExceptions derivation + glob-style matching + .platformConstraints.multiTenancy.isolationField path + PROHIBITED PATTERNS + no hardcoded field names anywhere)
- [OK] run-all-gates.sh endpoint naming sanitization as MANDATORY PATTERN (sed command with exact formula + PROHIBITED PATTERN for raw $ENDPOINT_PATH usage)
- [OK] DYNAMIC GATE EXPANSION PATTERNS (all guarded)
- [OK] BUILD EXECUTION ORDER clarifies Agent 6 stops after Step 5 (Rule 7 audit + structural verification)
- [OK] Split-first guard pattern for run-all-gates.sh (EXPECTED_VERIFY_SCRIPTS=32)
- [OK] gate-splitter.sh EXPECTED_SCRIPTS=33
- [OK] Templates clearly marked as templates
- [OK] verify-multi-tenant-isolation.sh cross-references data-relationships.json tenantKey
- [OK] verify-schema-imports.sh catches .js extensions in schema imports
- [OK] verify-error-handlers.sh validates JSON parse handler and global error handler
- [OK] verify-body-validation.sh enforces req.body -> validateBody/validateMultipart discipline
- [OK] verify-upload-config-sourced.sh enforces fileUploadConfig sourcing from platformConstraints
- [OK] verify-organisation-endpoint-naming.sh enforces /api/organisations/me singleton pattern
- [OK] verify-mvp-scope-boundaries.sh enforces MVP scope boundaries for platform resources
- [OK] verify-token-scoped-routing.sh enforces req.user.organisationId for org-scoped endpoints

**Status:** Production Ready

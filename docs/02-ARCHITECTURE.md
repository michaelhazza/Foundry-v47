# System Architecture

## Version Reference
- **This Document**: 02-ARCHITECTURE.md v1.0
- **Linked Documents**:
  - agent-0-constitution.md

---

## ADR 1: Server Binding and Port Configuration

**Context:** Application runs in multiple environments (local dev, production) with different server configurations.

**Decision:**
- **Production:** Single Express server serves both SPA and API on PORT (default: 5000), bound to 0.0.0.0
- **Development:** Dual-server setup:
  - Vite dev server on PORT 5000 (frontend hot reload)
  - Express API server on port 3001 (backend)
  - Vite proxies `/api/*` requests to Express backend

**Consequences:**
- Production deployment simplicity (single port binding)
- Development experience optimized (hot reload + API stability)
- env-manifest.json PORT default MUST be 5000 to match production binding
- Backend API port (3001) is a development-only constant, not configurable via environment variable

---

## ADR 2: CORS Configuration

**Context:** Multi-tenant SaaS platform requires secure cross-origin resource sharing.

**Decision:**
- **Production:** Explicit origin from APP_URL environment variable (e.g., `https://app.example.com`)
  - Literal wildcard (`origin: '*'`) is FORBIDDEN
  - Multiple origins not supported in MVP
- **Development:** Reflect request origin (`origin: true`) allowed for local testing
  - Enables localhost:5000, localhost:3001, and other dev ports

**Implementation:**
```typescript
// server/middleware/cors.ts
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.APP_URL 
    : true, // reflect request origin in dev
  credentials: true
};
```

**Consequences:**
- Production security enforced via APP_URL
- Development flexibility maintained
- Gate script `verify-no-wildcard-cors.sh` checks for literal `origin: '*'` string only

---

## ADR 3: Database Configuration (Drizzle + Neon)

**Context:** Application uses Drizzle ORM with Neon serverless PostgreSQL.

**Decision:**
- **Drizzle Kit config** (`drizzle.config.ts`):
  - MUST specify `dialect: 'postgresql'` explicitly
  - Schema import path: NO .js extensions (use `./server/db/schema/index`)
  - Output directory: `./server/db/migrations`
- **Database drivers:**
  - Production: `@neondatabase/serverless` v^0.10.0 (serverless HTTP driver)
  - Development/Test: Optional fallback to `pg` for local PostgreSQL
- **Health check:** Must verify database connectivity via test query

**drizzle.config.ts template:**
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './server/db/schema/index',
  out: './server/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**Consequences:**
- Neon serverless optimized for production
- Multi-environment database support via driver selection
- Health endpoint validates DB connectivity at runtime

---

## ADR 4: Dependency Management Standards

**Context:** Application requires stable, conflict-free package versions across environments.

**Decision:**
- **Version pinning:** Use semantic versioning with caret ranges (`^X.Y.Z`)
- **Lock file:** Commit `package-lock.json` to repository
- **Peer dependencies:** Verify compatibility before install
- **Pre-install validation:** Run `npm install --dry-run` before actual install
- **Conflict resolution:** Document breaking changes in Architecture Decision Log (below)

**Required dependency versions:**
- `drizzle-orm`: ^0.39.0
- `@neondatabase/serverless`: ^0.10.0 (matches drizzle-orm peer dependency)
- `express`: ^4.21.0
- `@types/node`: ^22.0.0

**Consequences:**
- Predictable builds across environments
- Explicit peer dependency management
- Version conflicts caught early via dry-run

---

## ADR 5: File Upload Architecture

**Context:** Platform accepts CSV, Excel, and JSON file uploads up to 100MB.

**Decision:**
- **Middleware:** `multer` for multipart/form-data parsing
- **Storage:** Temporary disk storage during upload (`/tmp/uploads`)
- **File size limit:** 104857600 bytes (100MB) enforced at middleware level
- **Retention:** Source files retained in database (encrypted) for 30 days, then purged
- **Allowed MIME types:**
  - `text/csv`
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (Excel)
  - `application/json`

**Implementation pattern:**
```typescript
// server/middleware/upload.ts
import multer from 'multer';

const upload = multer({
  dest: '/tmp/uploads',
  limits: { fileSize: 104857600 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = ['text/csv', 'application/json', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    cb(null, allowed.includes(file.mimetype));
  }
});
```

**Consequences:**
- File size enforcement prevents resource exhaustion
- MIME type validation prevents malicious uploads
- Temporary storage cleaned up after processing

---

## ADR 6: Processing Pipeline Architecture

**Context:** Source-agnostic processing pipeline transforms data through standardized stages.

**Decision:**
- **Pipeline stages:**
  1. **Ingestion:** Parse source format (CSV/Excel/JSON/API) into normalized records
  2. **Schema Mapping:** Map source fields to canonical schema fields
  3. **De-identification:** Apply masking/hashing/redaction rules to PII fields
  4. **Validation:** Enforce business rules and data quality checks
  5. **Output Generation:** Format as JSONL/JSON per project configuration
- **State tracking:** Each processing job tracks completion of all stages
- **Failure handling:** NO partial outputs - jobs fail atomically if any stage fails
- **Lineage:** Every dataset records source file IDs and transformation rules applied

**Invariants:**
- All sources processed through identical stages (source-agnostic)
- Output structure determined by canonical schema, not source structure
- De-identification is mandatory first-class stage, not optional

**Consequences:**
- Consistent processing behavior across all data source types
- Clear failure boundaries (no partial datasets)
- Compliance-ready lineage tracking

---

## ADR 7: Multi-Tenancy Isolation

**Context:** Platform serves multiple organisations with strict data isolation.

**Decision:**
- **Isolation field:** Every tenant-scoped table MUST have `organisation_id` foreign key
- **Query enforcement:** All queries MUST filter by `organisation_id` from JWT token
- **Middleware:** `requireAuth` middleware extracts `organisationId` from JWT and attaches to `req.user`
- **Service layer:** Services receive `organisationId` as required parameter for all operations
- **No cross-tenant access:** Database schema enforces isolation via foreign key constraints

**Service pattern:**
```typescript
// server/services/projects.service.ts
export async function getProjects(organisationId: string) {
  return db.query.projects.findMany({
    where: eq(projects.organisationId, organisationId)
  });
}
```

**Consequences:**
- Data leakage prevented at database level
- Service layer enforces organisationId requirement
- JWT token is single source of truth for tenant identity

---

## ADR 8: Encryption Architecture

**Context:** Platform processes PII data requiring encryption at rest per GDPR/SOC2.

**Decision:**
- **Algorithm:** AES-256-GCM for authenticated encryption
- **Key management:** Single `ENCRYPTION_KEY` environment variable (32 bytes / 64 hex chars)
- **Encrypted fields:**
  - Data source API credentials (tokens, passwords)
  - Raw uploaded file content (during 30-day retention)
  - De-identification mapping tables (reversible PII lineage)
- **NOT encrypted:**
  - De-identified output datasets (irreversibly masked/hashed - encryption unnecessary)
  - Public metadata (project names, schemas)

**Implementation:**
```typescript
// server/lib/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decrypt(ciphertext: string): string {
  const buffer = Buffer.from(ciphertext, 'base64');
  const iv = buffer.subarray(0, 16);
  const authTag = buffer.subarray(16, 32);
  const encrypted = buffer.subarray(32);
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]).toString('utf8');
}
```

**Boundary clarification:**
- **Encryption at rest:** Reversible protection for sensitive data storage (use encryption.ts)
- **De-identification:** Irreversible transformation for AI training data (NOT encryption - uses hashing/masking)

**Consequences:**
- Compliance with data protection regulations
- Credential security for API connectors
- De-identified outputs remain unencrypted (by design - no PII present)

---

## ADR 9: Health Check Design

**Context:** Production deployments require health check endpoint for orchestration.

**Decision:**
- **Endpoint:** `GET /health`
- **Response format:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-06T10:30:00.000Z",
  "checks": {
    "database": "connected"
  }
}
```
- **Database check:** Execute simple test query (`SELECT 1`) to verify connectivity
- **Status codes:**
  - 200: All checks pass
  - 503: Any check fails (database unreachable, etc.)

**Implementation:**
```typescript
// server/routes/health.routes.ts
router.get('/health', async (req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: { database: 'connected' }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: { database: 'disconnected' },
      error: error.message
    });
  }
});
```

**Consequences:**
- Production readiness for container orchestration (Docker, Kubernetes)
- Early detection of database connectivity issues
- Standard health check interface for monitoring tools

---

## ADR 10: Directory Structure

**Project root:**
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-level page components
│   │   ├── lib/           # Client utilities
│   │   └── App.tsx        # Root component
│   └── index.html
├── server/                # Express backend
│   ├── db/
│   │   ├── schema/        # Drizzle schema definitions
│   │   ├── migrations/    # Database migrations
│   │   └── index.ts       # Database connection
│   ├── lib/
│   │   ├── env.ts         # Environment variable validation
│   │   ├── auth.ts        # JWT helpers
│   │   ├── encryption.ts  # AES-256-GCM crypto (conditionally required)
│   │   └── config.ts      # App configuration
│   ├── middleware/
│   │   ├── auth.ts        # JWT authentication middleware
│   │   ├── cors.ts        # CORS configuration
│   │   └── upload.ts      # File upload middleware
│   ├── routes/            # Express route handlers
│   ├── services/          # Business logic layer
│   └── index.ts           # Express app entry point
├── docs/                  # Specification artifacts
│   ├── scope-manifest.json
│   ├── env-manifest.json
│   ├── data-relationships.json
│   ├── service-contracts.json
│   ├── ui-api-deps.json
│   └── 02-ARCHITECTURE.md (this file)
├── scripts/               # Verification gates (generated by Agent 6)
├── drizzle.config.ts      # Drizzle Kit configuration
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Environment Validation Pattern

**server/lib/env.ts implementation:**

```typescript
// Required environment variables
const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'APP_URL'];

// Conditionally required (production-only enforcement)
const conditionallyRequired = [
  {
    name: 'ENCRYPTION_KEY',
    whyRequired: 'Platform processes PII data that must be encrypted at rest per GDPR/SOC2'
  }
];

// Validate required variables
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

// Validate conditionally required (fail in production, warn in dev)
for (const { name, whyRequired } of conditionallyRequired) {
  if (!process.env[name]) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable: ${name}. ${whyRequired}`);
    } else {
      console.warn(`[WARNING] Missing ${name}. ${whyRequired}`);
    }
  }
}

// Validation rules
if (!process.env.DATABASE_URL?.startsWith('postgresql://')) {
  throw new Error('DATABASE_URL must start with postgresql://');
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

if (process.env.APP_URL && !/^https?:\/\/.+$/.test(process.env.APP_URL)) {
  throw new Error('APP_URL must be a valid URL with scheme');
}

if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length !== 64) {
  throw new Error('ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)');
}

// Export validated config
export const config = {
  database: {
    url: process.env.DATABASE_URL!
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET!
  },
  app: {
    url: process.env.APP_URL!,
    port: parseInt(process.env.PORT || '5000', 10)
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY // conditionally required
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};
```

---

## CORS Production Defaults

**Clarification on CORS origin configuration:**

- **Literal wildcard** (`origin: '*'`): String value `'*'` - FORBIDDEN in production
- **Reflect request origin** (`origin: true`): Boolean value - ALLOWED in development

The `verify-no-wildcard-cors.sh` gate checks for the literal string `origin: '*'` only. Using `origin: true` (which reflects the request's origin header) is permitted in development environments but should be replaced with explicit APP_URL in production.

---

## Architecture Decision Log

**Template for dependency version decisions:**

| Date | Package | Old Version | New Version | Reason | Breaking Changes |
|------|---------|-------------|-------------|--------|------------------|
| 2026-02-06 | @neondatabase/serverless | N/A | ^0.10.0 | Initial setup - matches drizzle-orm peer dependency | N/A |
| 2026-02-06 | drizzle-orm | N/A | ^0.39.0 | Initial setup - latest stable with Neon support | N/A |

**Instructions:** Add new rows when upgrading packages. Document breaking changes and migration steps.

---

## Forward References

The following enforcement mechanisms are specified in this document but will be generated by **Agent 6 (Implementation Orchestrator)**:

- `scripts/verify-env-manifest-schema.sh` - Validates env-manifest.json structure
- `scripts/verify-config-files-required.sh` - Checks required config files exist
- `scripts/verify-health-db-connectivity.sh` - Tests health endpoint database check
- `scripts/verify-no-wildcard-cors.sh` - Scans for literal wildcard CORS
- `scripts/verify-encryption-binary.sh` - Validates encryption implementation (conditional)

These scripts are specified as bash code blocks in agent-2-system-architecture.md and will be extracted and generated by Agent 6 during the build phase.

// Required environment variables
const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'APP_URL'];

// Conditionally required (production-only enforcement)
const conditionallyRequired = [
  {
    name: 'ENCRYPTION_KEY',
    whyRequired: 'Platform processes PII data that must be encrypted at rest per GDPR/SOC2',
  },
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
if (!process.env.DATABASE_URL?.startsWith('postgresql://') && !process.env.DATABASE_URL?.startsWith('postgres://')) {
  throw new Error('DATABASE_URL must start with postgresql:// or postgres://');
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
    url: process.env.DATABASE_URL!,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET!,
  },
  app: {
    url: process.env.APP_URL!,
    port: parseInt(process.env.PORT || '5000', 10),
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY, // conditionally required
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

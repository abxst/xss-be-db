// Environment configuration
// Access environment variables from Cloudflare Workers env

export interface EnvConfig {
  JWT_SECRET: string;
  CORS_ORIGIN: string;
  API_VERSION: string;
  NODE_ENV: string;
}

export function getEnvConfig(env: Env): EnvConfig {
  return {
    JWT_SECRET: env.JWT_SECRET,
    CORS_ORIGIN: env.CORS_ORIGIN,
    API_VERSION: env.API_VERSION,
    NODE_ENV: env.NODE_ENV,
  };
}

// Parse CORS origins (support multiple origins separated by comma)
export function getCorsOrigins(corsOrigin: string): string[] {
  if (corsOrigin === '*') {
    return ['*'];
  }
  return corsOrigin.split(',').map(origin => origin.trim());
}

// Check if origin is allowed
export function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (allowedOrigins.includes('*')) {
    return true;
  }
  if (!origin) {
    return false;
  }
  return allowedOrigins.includes(origin);
}


// CORS Middleware - Tập trung xử lý CORS cho toàn bộ API

/**
 * Parse CORS origins from comma-separated string
 * Filters out wildcard '*' for security
 */
function parseAllowedOrigins(corsOrigin: string): string[] {
  return corsOrigin
    .split(',')
    .map(o => o.trim())
    .filter(o => o.length > 0 && o !== '*'); // Remove wildcards
}

/**
 * Get the appropriate origin to return in CORS header
 * ALWAYS returns a specific origin (never '*') to support credentials
 */
function getAllowedOrigin(requestOrigin: string | null, allowedOrigins: string[]): string {
  // No allowed origins configured → return first request origin or default
  if (allowedOrigins.length === 0) {
    console.warn('⚠️ CORS_ORIGIN not configured properly. Using request origin or localhost fallback.');
    return requestOrigin || 'http://localhost:3000';
  }
  
  // If request origin matches one of the allowed origins → return it
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  
  // Request origin doesn't match or no origin header
  // → Return first allowed origin (ensures credentials work)
  return allowedOrigins[0];
}

/**
 * Wrap response với CORS headers
 * ALWAYS sets credentials to true (no wildcard support)
 */
export function addCorsHeaders(response: Response, corsOrigin: string, requestOrigin: string | null = null): Response {
  const headers = new Headers(response.headers);
  
  const allowedOrigins = parseAllowedOrigins(corsOrigin);
  const allowedOrigin = getAllowedOrigin(requestOrigin, allowedOrigins);
  
  headers.set('Access-Control-Allow-Origin', allowedOrigin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  
  // ALWAYS set credentials to true (we never use wildcard now)
  headers.set('Access-Control-Allow-Credentials', 'true');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Handle CORS preflight requests (OPTIONS)
 * ALWAYS sets credentials to true (no wildcard support)
 */
export function handleCorsPreflightRequest(corsOrigin: string, requestOrigin: string | null = null): Response {
  const allowedOrigins = parseAllowedOrigins(corsOrigin);
  const allowedOrigin = getAllowedOrigin(requestOrigin, allowedOrigins);
  
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    'Access-Control-Allow-Credentials': 'true', // ALWAYS true
    'Access-Control-Max-Age': '86400', // 24 hours
  };
  
  return new Response(null, {
    status: 204,
    headers,
  });
}


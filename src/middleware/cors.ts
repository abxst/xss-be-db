// CORS Middleware - Tập trung xử lý CORS cho toàn bộ API

/**
 * Parse CORS origins from comma-separated string
 */
function parseAllowedOrigins(corsOrigin: string): string[] {
  return corsOrigin.split(',').map(o => o.trim()).filter(o => o.length > 0);
}

/**
 * Get the appropriate origin to return in CORS header
 * When credentials are used, we CANNOT use '*', must return specific origin
 */
function getAllowedOrigin(requestOrigin: string | null, allowedOrigins: string[]): string {
  const hasWildcard = allowedOrigins.includes('*');
  const specificOrigins = allowedOrigins.filter(o => o !== '*');
  
  // Case 1: Wildcard ALONE → return wildcard (no credentials)
  if (hasWildcard && specificOrigins.length === 0) {
    return '*';
  }
  
  // Case 2: Wildcard + specific origins → DEV MODE
  // Allow ANY origin with credentials (useful for local development)
  // Example: CORS_ORIGIN="*, http://localhost:3000"
  if (hasWildcard && specificOrigins.length > 0 && requestOrigin) {
    return requestOrigin;
  }
  
  // Case 3: Only specific origins → PRODUCTION MODE
  // Check if request origin is in allowed list
  if (requestOrigin && specificOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  
  // Fallback: return first specific origin or wildcard
  return specificOrigins[0] || '*';
}

/**
 * Wrap response với CORS headers
 */
export function addCorsHeaders(response: Response, corsOrigin: string, requestOrigin: string | null = null): Response {
  const headers = new Headers(response.headers);
  
  const allowedOrigins = parseAllowedOrigins(corsOrigin);
  const allowedOrigin = getAllowedOrigin(requestOrigin, allowedOrigins);
  
  headers.set('Access-Control-Allow-Origin', allowedOrigin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  
  // MUST set credentials to true when using cookies
  // Cannot use with wildcard '*'
  if (allowedOrigin !== '*') {
    headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Handle CORS preflight requests (OPTIONS)
 */
export function handleCorsPreflightRequest(corsOrigin: string, requestOrigin: string | null = null): Response {
  const allowedOrigins = parseAllowedOrigins(corsOrigin);
  const allowedOrigin = getAllowedOrigin(requestOrigin, allowedOrigins);
  
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
  
  if (allowedOrigin !== '*') {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  return new Response(null, {
    status: 204,
    headers,
  });
}


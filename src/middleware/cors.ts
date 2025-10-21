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
  // If wildcard is in the list and there's a specific request origin, return it
  if (allowedOrigins.includes('*')) {
    // If there's a request origin, return it (for credentials support)
    if (requestOrigin) {
      return requestOrigin;
    }
    // No request origin, return wildcard
    return '*';
  }
  
  // Check if request origin is in allowed list
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  
  // Return first allowed origin as fallback
  return allowedOrigins[0] || '*';
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


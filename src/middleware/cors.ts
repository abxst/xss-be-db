// CORS Middleware - Tập trung xử lý CORS cho toàn bộ API

/**
 * Wrap response với CORS headers
 */
export function addCorsHeaders(response: Response, corsOrigin: string): Response {
  const headers = new Headers(response.headers);
  
  // CORS headers
  headers.set('Access-Control-Allow-Origin', corsOrigin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  
  // Allow credentials (cookies) if not wildcard
  if (corsOrigin !== '*') {
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
export function handleCorsPreflightRequest(corsOrigin: string): Response {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  };
  
  if (corsOrigin !== '*') {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  return new Response(null, {
    status: 204,
    headers,
  });
}


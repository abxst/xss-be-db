// Helper functions for API responses

export interface ResponseOptions {
  corsOrigin?: string;
  setCookie?: string;
}

export function getCorsHeaders(corsOrigin: string = '*', withCredentials: boolean = true): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  };
  
  // Allow credentials (cookies) if not wildcard
  if (withCredentials && corsOrigin !== '*') {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  return headers;
}

// Create cookie string for JWT token
export function createTokenCookie(token: string, maxAge: number = 7 * 24 * 60 * 60): string {
  // maxAge in seconds (default 7 days)
  const cookieParts = [
    `auth_token=${token}`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly', // Prevent JavaScript access
    'SameSite=Lax', // CSRF protection
    // 'Secure', // Uncomment for HTTPS only
  ];
  
  return cookieParts.join('; ');
}

// Create cookie to clear token
export function clearTokenCookie(): string {
  return 'auth_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax';
}

export function jsonResponse(data: any, status: number = 200, options?: ResponseOptions): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getCorsHeaders(options?.corsOrigin),
  };
  
  // Add Set-Cookie header if provided
  if (options?.setCookie) {
    headers['Set-Cookie'] = options.setCookie;
  }
  
  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}

export function successResponse(data: any, status: number = 200, options?: ResponseOptions): Response {
  return jsonResponse({ success: true, ...data }, status, options);
}

export function errorResponse(message: string, status: number = 400, error?: string, options?: ResponseOptions): Response {
  return jsonResponse({ success: false, message, error }, status, options);
}

export function unauthorized(message: string = 'Unauthorized', options?: ResponseOptions): Response {
  return errorResponse(message, 401, undefined, options);
}

export function notFound(message: string = 'Not found', options?: ResponseOptions): Response {
  return errorResponse(message, 404, undefined, options);
}

export function serverError(message: string = 'Internal server error', error?: string, options?: ResponseOptions): Response {
  return errorResponse(message, 500, error, options);
}

export function corsPreflightResponse(corsOrigin: string = '*'): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(corsOrigin, corsOrigin !== '*'),
  });
}

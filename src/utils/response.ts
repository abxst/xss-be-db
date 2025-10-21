// Helper functions for API responses
// CORS headers được xử lý tập trung tại middleware/cors.ts

export interface ResponseOptions {
  setCookie?: string;
  corsOrigin?: string;
}

/**
 * Create cookie string for JWT token
 * 
 * Cross-Origin Cookie Support:
 * - SameSite=None: Cho phép cookie được gửi cross-origin
 * - Secure: Bắt buộc khi dùng SameSite=None (chỉ HTTPS)
 * 
 * Note: Development (localhost) có thể dùng SameSite=Lax
 * Production (HTTPS) phải dùng SameSite=None + Secure
 */
export function createTokenCookie(token: string, maxAge: number = 7 * 24 * 60 * 60): string {
  // maxAge in seconds (default 7 days)
  const cookieParts = [
    `auth_token=${token}`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly', // Prevent JavaScript access
    'SameSite=None', // Allow cross-origin (required for CORS with credentials)
    'Secure', // Required with SameSite=None (HTTPS only)
  ];
  
  return cookieParts.join('; ');
}

/**
 * Create cookie to clear token
 * Must match the same attributes as createTokenCookie
 */
export function clearTokenCookie(): string {
  return 'auth_token=; Max-Age=0; Path=/; HttpOnly; SameSite=None; Secure';
}

export function jsonResponse(data: any, status: number = 200, options?: ResponseOptions): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
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

// Helper functions for API responses

export interface ResponseOptions {
  corsOrigin?: string;
}

export function getCorsHeaders(corsOrigin: string = '*'): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function jsonResponse(data: any, status: number = 200, options?: ResponseOptions): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(options?.corsOrigin),
    },
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
    headers: getCorsHeaders(corsOrigin),
  });
}

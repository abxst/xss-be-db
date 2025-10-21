// CORS Middleware - Tập trung xử lý CORS cho toàn bộ API

/**
 * Wrap response với CORS headers
 */
export function addCorsHeaders(response: Response, corsOrigin: string): Response {
  const headers = new Headers(response.headers);
  
  // CORS headers
  // Note: Nếu corsOrigin là '*', không thể dùng credentials
  // Frontend phải gửi request mà không có credentials: 'include'
  // hoặc backend phải set CORS_ORIGIN cụ thể (http://localhost:3000)
  const origin = corsOrigin === '*' ? corsOrigin : corsOrigin;
  
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  
  // MUST set credentials to true when using cookies
  // Điều này yêu cầu CORS_ORIGIN KHÔNG được là '*'
  if (origin !== '*') {
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


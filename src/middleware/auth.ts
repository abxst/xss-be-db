// Authentication middleware
import { verifyJWT, JWTPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

// Extract token from cookie
function getTokenFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const authCookie = cookies.find(c => c.startsWith('auth_token='));
  
  if (!authCookie) return null;
  
  return authCookie.substring('auth_token='.length);
}

// Extract and verify JWT token from Cookie or Authorization header
export async function authenticateUser(request: Request, secret: string): Promise<JWTPayload | null> {
  // Try to get token from cookie first
  let token = getTokenFromCookie(request);
  
  // Fallback to Authorization header (for backward compatibility)
  if (!token) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  if (!token) {
    return null;
  }

  return await verifyJWT(token, secret);
}

// Check if user is authenticated
export function requireAuth(user: JWTPayload | null): user is JWTPayload {
  return user !== null;
}


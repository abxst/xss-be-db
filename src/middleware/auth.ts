// Authentication middleware
import { verifyJWT, JWTPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

// Extract and verify JWT token from Authorization header
export async function authenticateUser(request: Request, secret: string): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  return await verifyJWT(token, secret);
}

// Check if user is authenticated
export function requireAuth(user: JWTPayload | null): user is JWTPayload {
  return user !== null;
}


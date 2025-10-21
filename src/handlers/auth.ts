// Authentication handlers (register, login, logout)
import { hashPassword, verifyPassword, generateUUID } from '../utils/crypto';
import { signJWT } from '../utils/jwt';
import { successResponse, errorResponse, createTokenCookie, clearTokenCookie } from '../utils/response';
import { getEnvConfig } from '../config/env';
import { validateRegister, validateLogin, formatValidationErrors } from '../utils/validation';
import type { RegisterRequest, LoginRequest, AuthResponse } from '../types/api';

// Register a new user
export async function handleRegister(request: Request, env: Env): Promise<Response> {
  try {
    const config = getEnvConfig(env);
    const responseOptions = { corsOrigin: config.CORS_ORIGIN };
    
    const body = await request.json() as RegisterRequest;
    const { username, password, name } = body;

    // Validate input
    const validation = validateRegister({ username, password, name });
    if (!validation.valid) {
      return errorResponse(formatValidationErrors(validation), 400, undefined, responseOptions);
    }

    // Check if username already exists
    const existingUser = await env.DB.prepare(
      'SELECT uuid FROM users WHERE username = ?'
    ).bind(username).first();

    if (existingUser) {
      return errorResponse('Username already exists', 409, undefined, responseOptions);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate UUID and create user
    const uuid = generateUUID();
    const timeCreate = Math.floor(Date.now() / 1000);

    await env.DB.prepare(
      'INSERT INTO users (uuid, username, password, name, time_create) VALUES (?, ?, ?, ?, ?)'
    ).bind(uuid, username, hashedPassword, name, timeCreate).run();

    // Generate JWT token (expires in 7 days)
    const token = await signJWT({
      uuid,
      username,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
    }, config.JWT_SECRET);

    // Set token in HTTP-only cookie
    const cookieString = createTokenCookie(token);

    const response: AuthResponse = {
      success: true,
      user: {
        uuid,
        username,
        name
      },
      message: 'Registration successful'
    };

    return successResponse(response, 201, {
      ...responseOptions,
      setCookie: cookieString
    });
  } catch (error) {
    console.error('Register error:', error);
    const config = getEnvConfig(env);
    return errorResponse('Registration failed', 500, error instanceof Error ? error.message : 'Unknown error', { corsOrigin: config.CORS_ORIGIN });
  }
}

// Login user
export async function handleLogin(request: Request, env: Env): Promise<Response> {
  try {
    const config = getEnvConfig(env);
    const responseOptions = { corsOrigin: config.CORS_ORIGIN };
    
    const body = await request.json() as LoginRequest;
    const { username, password } = body;

    // Validate input
    const validation = validateLogin({ username, password });
    if (!validation.valid) {
      return errorResponse(formatValidationErrors(validation), 400, undefined, responseOptions);
    }

    // Find user
    const user = await env.DB.prepare(
      'SELECT uuid, username, password, name FROM users WHERE username = ?'
    ).bind(username).first() as any;

    if (!user) {
      return errorResponse('Invalid username or password', 401, undefined, responseOptions);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return errorResponse('Invalid username or password', 401, undefined, responseOptions);
    }

    // Update last login
    const lastLogin = Math.floor(Date.now() / 1000);
    await env.DB.prepare(
      'UPDATE users SET last_login = ? WHERE uuid = ?'
    ).bind(lastLogin, user.uuid).run();

    // Generate JWT token (expires in 7 days)
    const token = await signJWT({
      uuid: user.uuid,
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
    }, config.JWT_SECRET);

    // Set token in HTTP-only cookie
    const cookieString = createTokenCookie(token);

    const response: AuthResponse = {
      success: true,
      user: {
        uuid: user.uuid,
        username: user.username,
        name: user.name
      },
      message: 'Login successful'
    };

    return successResponse(response, 200, {
      ...responseOptions,
      setCookie: cookieString
    });
  } catch (error) {
    console.error('Login error:', error);
    const config = getEnvConfig(env);
    return errorResponse('Login failed', 500, error instanceof Error ? error.message : 'Unknown error', { corsOrigin: config.CORS_ORIGIN });
  }
}

// Logout user
export async function handleLogout(request: Request, env: Env): Promise<Response> {
  try {
    const config = getEnvConfig(env);
    const responseOptions = { corsOrigin: config.CORS_ORIGIN };

    // Clear the cookie
    const cookieString = clearTokenCookie();

    return successResponse({
      message: 'Logout successful'
    }, 200, {
      ...responseOptions,
      setCookie: cookieString
    });
  } catch (error) {
    console.error('Logout error:', error);
    const config = getEnvConfig(env);
    return errorResponse('Logout failed', 500, error instanceof Error ? error.message : 'Unknown error', { corsOrigin: config.CORS_ORIGIN });
  }
}

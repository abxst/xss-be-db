// API Routes với Switch Case
import { authenticateUser } from '../middleware/auth';
import { handleRegister, handleLogin, handleLogout } from '../handlers/auth';
import { 
  handleCreatePost, 
  handleGetPosts, 
  handleGetMyPosts, 
  handleSearchPosts,
  handleGetPost 
} from '../handlers/posts';
import { 
  handleCreateComment, 
  handleGetComments,
  handleGetUserComments
} from '../handlers/comments';
import { 
  handleDatabaseHealth,
  handleDetailedDatabaseHealth,
  handleFullHealth
} from '../handlers/health';
import { errorResponse, jsonResponse, corsPreflightResponse } from '../utils/response';
import { getEnvConfig } from '../config/env';

export interface RouteContext {
  request: Request;
  env: Env;
  url: URL;
  path: string;
  method: string;
}

// Route handler
export async function handleRoute(context: RouteContext): Promise<Response> {
  const { request, env, url, path, method } = context;
  const config = getEnvConfig(env);
  const responseOptions = { corsOrigin: config.CORS_ORIGIN };

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return corsPreflightResponse(config.CORS_ORIGIN);
  }

  // Get authenticated user (if any)
  const user = await authenticateUser(request, config.JWT_SECRET);

  // Parse route pattern
  const routeKey = `${method} ${path}`;

  // Switch case cho routing
  switch (true) {
    // ===== HEALTH CHECK =====
    case method === 'GET' && path === '/':
      return jsonResponse({
        success: true,
        message: 'XSS Lab API is running',
        version: config.API_VERSION,
        environment: config.NODE_ENV,
          endpoints: {
            auth: {
              register: 'POST /api/auth/register',
              login: 'POST /api/auth/login',
              logout: 'POST /api/auth/logout'
            },
          posts: {
            create: 'POST /api/posts',
            getAll: 'GET /api/posts',
            getMy: 'GET /api/posts/my',
            search: 'GET /api/posts/search?q=...',
            getOne: 'GET /api/posts/:post_uuid'
          },
          comments: {
            create: 'POST /api/comments',
            getByPost: 'GET /api/posts/:post_uuid/comments',
            getMy: 'GET /api/comments/my'
          },
          health: {
            full: 'GET /api/health',
            database: 'GET /api/health/db',
            databaseDetailed: 'GET /api/health/db/detailed'
          }
        }
      }, 200, responseOptions);

    // ===== HEALTH CHECK ROUTES =====
    case method === 'GET' && path === '/api/health':
      return handleFullHealth(request, env);

    case method === 'GET' && path === '/api/health/db':
      return handleDatabaseHealth(request, env);

    case method === 'GET' && path === '/api/health/db/detailed':
      return handleDetailedDatabaseHealth(request, env);

    // ===== AUTHENTICATION ROUTES =====
    case method === 'POST' && path === '/api/auth/register':
      return handleRegister(request, env);

    case method === 'POST' && path === '/api/auth/login':
      return handleLogin(request, env);

    case method === 'POST' && path === '/api/auth/logout':
      return handleLogout(request, env);

    // ===== POST ROUTES =====
    case method === 'POST' && path === '/api/posts':
      return handleCreatePost(request, env, user);

    case method === 'GET' && path === '/api/posts':
      return handleGetPosts(request, env);

    case method === 'GET' && path === '/api/posts/my':
      return handleGetMyPosts(request, env, user);

    case method === 'GET' && path === '/api/posts/search':
      return handleSearchPosts(request, env);

    // ===== COMMENT ROUTES =====
    case method === 'POST' && path === '/api/comments':
      return handleCreateComment(request, env, user);

    case method === 'GET' && path === '/api/comments/my':
      return handleGetUserComments(request, env, user);

    // ===== DYNAMIC ROUTES (Pattern Matching) =====
    default:
      return handleDynamicRoutes(context, user);
  }
}

// Handle dynamic routes with path parameters
async function handleDynamicRoutes(context: RouteContext, user: any): Promise<Response> {
  const { request, env, path, method } = context;
  const config = getEnvConfig(env);
  const responseOptions = { corsOrigin: config.CORS_ORIGIN };

  // Match: GET /api/posts/:post_uuid
  const postMatch = path.match(/^\/api\/posts\/([a-zA-Z0-9-]+)$/);
  if (postMatch && method === 'GET') {
    const postUuid = postMatch[1];
    return handleGetPost(request, env, postUuid);
  }

  // Match: GET /api/posts/:post_uuid/comments
  const postCommentsMatch = path.match(/^\/api\/posts\/([a-zA-Z0-9-]+)\/comments$/);
  if (postCommentsMatch && method === 'GET') {
    const postUuid = postCommentsMatch[1];
    return handleGetComments(request, env, postUuid);
  }

  // No route matched - 404
  return errorResponse('Endpoint not found', 404, undefined, responseOptions);
}


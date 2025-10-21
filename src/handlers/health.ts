// Health check handlers
import { successResponse, errorResponse, jsonResponse } from '../utils/response';
import { getEnvConfig } from '../config/env';

// Check database connection
export async function handleDatabaseHealth(request: Request, env: Env): Promise<Response> {
  try {
    const startTime = Date.now();
    
    // Test database connection với query đơn giản
    const result = await env.DB.prepare('SELECT 1 as test').first();
    
    const responseTime = Date.now() - startTime;
    
    if (result && result.test === 1) {
      return successResponse({
        database: {
          status: 'healthy',
          connected: true,
          responseTime: `${responseTime}ms`,
          message: 'Database connection is working properly'
        }
      });
    } else {
      return errorResponse(
        'Database connection test failed',
        503,
        'Unexpected query result'
      );
    }
  } catch (error) {
    console.error('Database health check error:', error);
    return errorResponse(
      'Database connection failed',
      503,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

// Check database với thông tin chi tiết hơn
export async function handleDetailedDatabaseHealth(request: Request, env: Env): Promise<Response> {
  try {
    const checks: any = {
      timestamp: new Date().toISOString(),
      database: {
        status: 'unknown',
        connected: false,
        tables: {}
      }
    };
    
    // Test basic connection
    const startTime = Date.now();
    try {
      await env.DB.prepare('SELECT 1').first();
      checks.database.connected = true;
      checks.database.responseTime = `${Date.now() - startTime}ms`;
    } catch (error) {
      checks.database.error = error instanceof Error ? error.message : 'Connection failed';
      return errorResponse(
        'Database connection failed',
        503,
        checks.database.error
      );
    }
    
    // Check các bảng có tồn tại không
    try {
      // Check users table
      const usersCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first() as any;
      checks.database.tables.users = {
        exists: true,
        count: usersCount?.count || 0
      };
      
      // Check posts table
      const postsCount = await env.DB.prepare('SELECT COUNT(*) as count FROM posts').first() as any;
      checks.database.tables.posts = {
        exists: true,
        count: postsCount?.count || 0
      };
      
      // Check comments table
      const commentsCount = await env.DB.prepare('SELECT COUNT(*) as count FROM comments').first() as any;
      checks.database.tables.comments = {
        exists: true,
        count: commentsCount?.count || 0
      };
      
      checks.database.status = 'healthy';
      
    } catch (error) {
      checks.database.status = 'degraded';
      checks.database.tablesError = error instanceof Error ? error.message : 'Could not check tables';
    }
    
    return successResponse(checks);
    
  } catch (error) {
    console.error('Detailed database health check error:', error);
    return errorResponse(
      'Health check failed',
      503,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

// Full system health check
export async function handleFullHealth(request: Request, env: Env): Promise<Response> {
  try {
    const config = getEnvConfig(env);
    
    const health: any = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: config.API_VERSION,
      environment: config.NODE_ENV,
      services: {}
    };
    
    // Check database
    try {
      const dbStart = Date.now();
      await env.DB.prepare('SELECT 1').first();
      health.services.database = {
        status: 'healthy',
        responseTime: `${Date.now() - dbStart}ms`
      };
    } catch (error) {
      health.status = 'degraded';
      health.services.database = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
    
    // API service (luôn healthy nếu đến được đây)
    health.services.api = {
      status: 'healthy'
    };
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    return jsonResponse(health, statusCode);
    
  } catch (error) {
    console.error('Full health check error:', error);
    return errorResponse(
      'Health check failed',
      503,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}


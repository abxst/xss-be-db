// Main entry point for XSS Lab API
import { handleRoute } from './router/routes';
import { serverError } from './utils/response';
import { getEnvConfig } from './config/env';
import { addCorsHeaders, handleCorsPreflightRequest } from './middleware/cors';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const config = getEnvConfig(env);
    const corsOrigin = config.CORS_ORIGIN;

    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;

      // Handle CORS preflight globally
      if (method === 'OPTIONS') {
        return handleCorsPreflightRequest(corsOrigin);
      }

      // Create route context
      const context = {
        request,
        env,
        url,
        path,
        method,
      };

      // Handle route
      const response = await handleRoute(context);

      // Add CORS headers to all responses
      return addCorsHeaders(response, corsOrigin);

    } catch (error) {
      console.error('Server error:', error);
      const response = serverError(
        'Internal server error',
        error instanceof Error ? error.message : 'Unknown error'
      );
      
      // Add CORS headers to error responses
      return addCorsHeaders(response, corsOrigin);
    }
  },
} satisfies ExportedHandler<Env>;

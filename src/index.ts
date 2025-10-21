// Main entry point for XSS Lab API
import { handleRoute } from './router/routes';
import { serverError } from './utils/response';
import { getEnvConfig } from './config/env';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;

      // Create route context
      const context = {
        request,
        env,
        url,
        path,
        method,
      };

      // Handle route
      return await handleRoute(context);

    } catch (error) {
      console.error('Server error:', error);
      const config = getEnvConfig(env);
      return serverError(
        'Internal server error',
        error instanceof Error ? error.message : 'Unknown error',
        { corsOrigin: config.CORS_ORIGIN }
      );
    }
  },
} satisfies ExportedHandler<Env>;

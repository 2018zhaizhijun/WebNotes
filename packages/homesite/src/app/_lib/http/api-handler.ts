import joi from 'joi';
import { NextRequest } from 'next/server';
import { authMiddleware, validateMiddleware } from './api-middlewares';
import { ResponseError, errorHandler } from './error-handler';

function isPublicPath(req: NextRequest) {
  // public routes that don't require authentication
  const publicPaths = [
    'GET:/api/user',
    'GET:/api/highlights',
    'GET:/api/strokes',
    'GET:/api/pdf',
    'GET:/api/favourite/users',
    'GET:/api/favourite/websites',
    'GET:/api/favourite/notes',
    'GET:/api/query/authors',
    'GET:/api/query/websites',
    'GET:/api/search/authors',
    'GET:/api/search/websites',
    'GET:/api/website',
    'POST:/api/website',
  ];
  return publicPaths.includes(`${req.method}:${req.nextUrl.pathname}`);
}

function apiHandler(
  handler: (req: NextRequest, ...args: any) => Promise<any>,
  schema?: { [k: string]: joi.Schema }
) {
  return async (req: NextRequest, ...args: any) => {
    try {
      // global middlewares
      if (!isPublicPath(req)) {
        await authMiddleware(req);
      }
      await validateMiddleware(req, schema);
      // route handler
      const response = await handler(req, ...args);

      return response;
    } catch (err) {
      // global error handler
      return errorHandler(err as ResponseError);
    }
  };
}

export { apiHandler };

import { authOptions } from '@/api/auth/[...nextauth]/route';
import joi from 'joi';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { Logger } from '../logger/logger';
import { ResponseError } from './error-handler';

async function authMiddleware(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // validation session
  if (!userId) {
    throw new ResponseError({ message: 'Unauthorized Access', status: 401 });
  }

  req.headers.set('userId', userId);
}

async function validateMiddleware(
  req: NextRequest,
  schema?: { [k: string]: joi.Schema }
) {
  if (!schema) return;
  const api = `${req.method}:${req.nextUrl.pathname}`;

  // eslint-disable-next-line prefer-const
  let error_details: joi.ValidationError['details'] = [];
  if (schema['params']) {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    Logger.info(`${api} params: ${JSON.stringify(params)}`);
    const { error } = schema['params'].validate(params, { abortEarly: false });
    error_details = error_details.concat(error?.details || []);
  }
  if (schema['payload']) {
    const options = {
      abortEarly: false, // include all errors
      allowUnknown: true, // ignore unknown props
      stripUnknown: true, // remove unknown props
    };

    const body = await req.json().catch(() => ({}));
    Logger.info(`${api} payload: ${JSON.stringify(body)}`);
    const { error, value } = schema['payload'].validate(body, options);
    // update req.json() to return sanitized req body
    req.json = () => value;

    error_details = error_details.concat(error?.details || []);
  }

  if (error_details.length > 0) {
    throw new ResponseError({
      message: `Validation error: ${error_details
        .map((x) => x.message)
        .join(', ')}`,
      status: 400,
      api,
    });
  }
}

export { authMiddleware, validateMiddleware };

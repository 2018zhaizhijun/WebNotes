import { NextResponse } from 'next/server';
import { Logger } from '../logger/logger';

export const CODE_INFO = {
  AUTHOR_NOT_FOUND: {
    code: 240002,
    msg: 'Author not found',
  },
};

export class ResponseError extends Error {
  msg: string;
  code: number;
  status?: number;
  api?: string;

  constructor(info: {
    message: string;
    code?: number;
    status?: number;
    api?: string;
  }) {
    super(info.message);
    this.msg = info.message;
    this.code = info.code || 0;
    this.status = info.status;
    this.api = info.api;
  }

  error() {
    return {
      code: this.code,
      message: this.message,
    };
  }
}

export function errorHandler(e: ResponseError) {
  Logger.error(JSON.stringify(e));
  return NextResponse.json(e.error?.() || e, { status: e.status || 500 });
}

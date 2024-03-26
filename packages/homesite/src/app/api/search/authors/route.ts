import db from '@/_lib/db/prisma';
import { apiHandler } from '@/_lib/http/api-handler';
import joi from 'joi';
import { NextRequest, NextResponse } from 'next/server';

// 搜索用户
export const GET = apiHandler(
  async (req: NextRequest) => {
    const regexp = req.nextUrl.searchParams.get('regexp');

    const author_result = await db
      .selectFrom('User')
      .select(['id', 'name', 'image'])
      .where('name', 'ilike', `%${regexp}%`)
      .execute();

    return NextResponse.json({
      author_result,
    });
  },
  {
    params: joi.object({
      regexp: joi.string().required(),
    }),
  }
);

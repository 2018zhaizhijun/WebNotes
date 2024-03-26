import db from '@/_lib/db/prisma';
import { apiHandler } from '@/_lib/http/api-handler';
import joi from 'joi';
import { NextRequest, NextResponse } from 'next/server';

// 获取用户信息
// 若是根据用户名查询其他用户，则返回简化信息；若是不传入用户名，则查询当前登录用户，返回完整信息
export const GET = apiHandler(
  async (req: NextRequest) => {
    const userName = req.nextUrl.searchParams.get('name');

    if (userName) {
      const result = await db
        .selectFrom('User')
        .where('name', '=', userName)
        .select(['id', 'name', 'image'])
        .execute();

      return NextResponse.json(result);
    }

    const userId = req.headers.get('userId');

    const result = await db
      .selectFrom('User')
      .where('id', '=', userId)
      .selectAll()
      .execute();

    return NextResponse.json(result);
  },
  {
    params: joi.object({
      name: joi.string(),
    }),
  }
);

// 更新用户信息
export const PUT = apiHandler(
  async (req: NextRequest) => {
    const request = await req.json();
    const userId = req.headers.get('userId');

    await db
      .updateTable('User')
      .set({
        ...request,
      })
      .where('id', '=', userId)
      .executeTakeFirst();

    return NextResponse.json(request);
  },
  {
    payload: joi.object({
      name: joi.string(),
      image: joi.string(),
    }),
  }
);

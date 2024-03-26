import db from '@/_lib/db/prisma';
import { apiHandler } from '@/_lib/http/api-handler';
import joi from 'joi';
import { NextRequest, NextResponse } from 'next/server';

// 查询用户收藏的其他用户（仅id）
export const GET = apiHandler(
  async (req: NextRequest) => {
    const userId = req.nextUrl.searchParams.get('userId');
    const followerId = req.headers.get('userId');

    let query = db
      .selectFrom('FavouriteUser')
      .where('followerId', '=', followerId);

    if (userId) {
      query = query.where('userId', '=', userId);
    }
    const result = await query.selectAll().execute();

    return NextResponse.json(result);
  },
  {
    params: joi.object({
      userId: joi.string(),
    }),
  }
);

// 收藏用户
export const POST = apiHandler(
  async (req: NextRequest) => {
    const request = await req.json();
    const followerId = req.headers.get('userId');

    await db
      .insertInto('FavouriteUser')
      .values({
        ...request,
        followerId: followerId,
      })
      .executeTakeFirst();

    return NextResponse.json(request, { status: 201 });
  },
  {
    payload: joi.object({
      userId: joi.string().required(),
    }),
  }
);

// 取消收藏
export const DELETE = apiHandler(
  async (req: NextRequest) => {
    const userId = req.nextUrl.searchParams.get('userId');
    const followerId = req.headers.get('userId');

    await db
      .deleteFrom('FavouriteUser')
      .where('followerId', '=', followerId)
      .where('userId', '=', userId)
      .executeTakeFirst();

    return NextResponse.json({});
  },
  {
    params: joi.object({
      userId: joi.string().required(),
    }),
  }
);

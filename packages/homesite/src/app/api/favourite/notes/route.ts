import db from '@/_lib/db/prisma';
import { apiHandler } from '@/_lib/http/api-handler';
import joi from 'joi';
import { NextRequest, NextResponse } from 'next/server';

// 查询用户收藏的笔记
export const GET = apiHandler(
  async (req: NextRequest) => {
    const userId = req.nextUrl.searchParams.get('userId');
    const url = req.nextUrl.searchParams.get('url');
    const followerId = req.headers.get('userId');

    let query = db
      .selectFrom('FavouriteNote')
      .where('followerId', '=', followerId);

    if (userId) {
      query = query.where('userId', '=', userId);
    }
    if (url) {
      query = query.where('websiteUrl', '=', url);
    }
    const result = await query.selectAll().execute();

    return NextResponse.json(result);
  },
  {
    params: joi.object({
      userId: joi.string(),
      url: joi.string(),
    }),
  }
);

// 收藏笔记
export const POST = apiHandler(
  async (req: NextRequest) => {
    const request = await req.json();
    const followerId = req.headers.get('userId');

    await db
      .insertInto('FavouriteNote')
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
      websiteUrl: joi.string().required(),
      noteRename: joi.string().required(),
      tag: joi.string().required(),
    }),
  }
);

// 更新收藏笔记的信息
export const PUT = apiHandler(
  async (req: NextRequest) => {
    const userId = req.nextUrl.searchParams.get('userId');
    const url = req.nextUrl.searchParams.get('url');
    const request = await req.json();

    const followerId = req.headers.get('userId');

    await db
      .updateTable('FavouriteNote')
      .set({
        ...request,
      })
      .where('followerId', '=', followerId)
      .where('websiteUrl', '=', url)
      .where('userId', '=', userId)
      .executeTakeFirst();

    return NextResponse.json(request);
  },
  {
    params: joi.object({
      userId: joi.string().required(),
      url: joi.string().required(),
    }),
    payload: joi.object({
      noteRename: joi.string(),
      tag: joi.string(),
    }),
  }
);

// 取消收藏
export const DELETE = apiHandler(
  async (req: NextRequest) => {
    const userId = req.nextUrl.searchParams.get('userId');
    const url = req.nextUrl.searchParams.get('url');

    const followerId = req.headers.get('userId');

    await db
      .deleteFrom('FavouriteNote')
      .where('followerId', '=', followerId)
      .where('websiteUrl', '=', url)
      .where('userId', '=', userId)
      .executeTakeFirst();

    return NextResponse.json({});
  },
  {
    params: joi.object({
      userId: joi.string().required(),
      url: joi.string().required(),
    }),
  }
);

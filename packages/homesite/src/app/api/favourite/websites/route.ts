import db from '@/_lib/db/prisma';
import { apiHandler } from '@/_lib/http/api-handler';
import joi from 'joi';
import { NextRequest, NextResponse } from 'next/server';

// 查询用户收藏的网站
export const GET = apiHandler(
  async (req: NextRequest) => {
    const url = req.nextUrl.searchParams.get('url');
    const followerId = req.headers.get('userId');

    let query = db
      .selectFrom('FavouriteWebsite')
      .where('followerId', '=', followerId);

    if (url) {
      query = query.where('websiteUrl', '=', url);
    }
    const result = await query.selectAll().execute();

    return NextResponse.json(result);
  },
  {
    params: joi.object({
      url: joi.string(),
    }),
  }
);

// 收藏网站
export const POST = apiHandler(
  async (req: NextRequest) => {
    const request = await req.json();
    const followerId = req.headers.get('userId');

    await db
      .insertInto('FavouriteWebsite')
      .values({
        ...request,
        followerId: followerId,
      })
      .executeTakeFirst();

    return NextResponse.json(request, { status: 201 });
  },
  {
    payload: joi.object({
      websiteUrl: joi.string().required(),
      websiteRename: joi.string().required(),
      tag: joi.string().required(),
    }),
  }
);

// 更新收藏网站的信息
export const PUT = apiHandler(
  async (req: NextRequest) => {
    const url = req.nextUrl.searchParams.get('url');
    const followerId = req.headers.get('userId');
    const request = await req.json();

    await db
      .updateTable('FavouriteWebsite')
      .set({
        ...request,
      })
      .where('followerId', '=', followerId)
      .where('websiteUrl', '=', url)
      .executeTakeFirst();

    return NextResponse.json(request);
  },
  {
    params: joi.object({
      url: joi.string().required(),
    }),
    payload: joi.object({
      websiteRename: joi.string(),
      tag: joi.string(),
    }),
  }
);

// 取消收藏
export const DELETE = apiHandler(
  async (req: NextRequest) => {
    const url = req.nextUrl.searchParams.get('url');
    const followerId = req.headers.get('userId');

    await db
      .deleteFrom('FavouriteWebsite')
      .where('followerId', '=', followerId)
      .where('websiteUrl', '=', url)
      .executeTakeFirst();

    return NextResponse.json({});
  },
  {
    params: joi.object({
      url: joi.string().required(),
    }),
  }
);

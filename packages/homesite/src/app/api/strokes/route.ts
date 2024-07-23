import db from '@/_lib/db/prisma';
import { apiHandler } from '@/_lib/http/api-handler';
import { joiStroke } from '@/_lib/http/joi';
import joi from 'joi';
import { sql } from 'kysely';
import { NextRequest, NextResponse } from 'next/server';

// 根据用户和网站查询笔画
export const GET = apiHandler(
  async (req: NextRequest) => {
    const url = req.nextUrl.searchParams.get('url');

    let query = db.selectFrom('Stroke');

    const authorId = req.nextUrl.searchParams.get('authorId');
    if (authorId) {
      query = query.where('authorId', '=', authorId);

      // TODO: 公开/私有模式
      // const userId = req.headers.get('userId');

      // if (userId !== authorId) {
      //   query = query.where('privacy', '=', false);
      // }
    }

    if (url) {
      query = query.where('url', '=', url);
    }

    query = query.orderBy(sql`position->>'pageNumber' ASC, "createdAt" ASC`);
    const result = await query.selectAll().execute();

    return NextResponse.json(result);
  },
  {
    params: joi.object({
      url: joi.string(),
      authorId: joi.string(),
    }),
  }
);

// 创建笔画
export const POST = apiHandler(
  async (req: NextRequest) => {
    const request = await req.json();
    const userId = req.headers.get('userId');

    const strokes = request.map((item: any) => {
      return {
        ...item,
        authorId: userId,
        id: undefined,
      };
    });

    await db.insertInto('Stroke').values(strokes).executeTakeFirst();

    return NextResponse.json(strokes, { status: 201 });
  },
  {
    payload: joi.array().items(joiStroke),
  }
);

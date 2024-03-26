import db from '@/_lib/db/prisma';
import { apiHandler } from '@/_lib/http/api-handler';
import joi from 'joi';
import { NextRequest, NextResponse } from 'next/server';

// 查询在某个网站上做了笔记的所有用户
export const GET = apiHandler(
  async (req: NextRequest) => {
    const url = req.nextUrl.searchParams.get('url');

    const result = await db
      .selectFrom('User')
      .select(['id', 'name', 'image'])
      .where(({ eb, selectFrom }) =>
        eb(
          'id',
          'in',
          selectFrom('Highlight')
            .select('Highlight.authorId')
            .where('Highlight.url', '=', url)
        )
      )
      .execute();

    return NextResponse.json(result);
  },
  {
    params: joi.object({
      url: joi.string().required(),
    }),
  }
);

import db from '@/_lib/db/prisma';
import { apiHandler } from '@/_lib/http/api-handler';
import joi from 'joi';
import { NextRequest, NextResponse } from 'next/server';

// 查询网站信息（ pdf 的 title 和 abstract ）
export const GET = apiHandler(
  async (req: NextRequest) => {
    const url = req.nextUrl.searchParams.get('url');
    const id = req.nextUrl.searchParams.get('id');

    let query = db.selectFrom('Website');

    if (url) {
      query = query.where('url', '=', url);
    } else if (id) {
      query = query.where('id', '=', Number(id));
    }

    const result = await query.selectAll().execute();

    return NextResponse.json(result);
  },
  {
    params: joi.object({
      url: joi.string(),
      id: joi.string(),
    }),
  }
);

// 添加网站信息
export const POST = apiHandler(
  async (req: NextRequest) => {
    const request = await req.json();

    await db
      .insertInto('Website')
      .values({
        ...request,
      })
      .executeTakeFirst();

    return NextResponse.json(request, { status: 201 });
  },
  {
    payload: joi.object({
      url: joi.string().required(),
      title: joi.string(),
      abstract: joi.string(),
    }),
  }
);

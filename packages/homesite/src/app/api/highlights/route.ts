import { NextRequest, NextResponse } from 'next/server';
// import prisma from "@/lib/prisma";
import db from '@/_lib/db/prisma';
import { apiHandler } from '@/_lib/http/api-handler';
import { joiHighlight } from '@/_lib/http/joi';
import joi from 'joi';
import { sql } from 'kysely';

// 根据用户和网站查询高亮
export const GET = apiHandler(
  async (req: NextRequest) => {
    const url = req.nextUrl.searchParams.get('url');

    let query = db.selectFrom('Highlight');

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

    query = query.orderBy(
      sql`position->>'pageNumber' ASC, position->'boundingRect'->>'y1' ASC`
    );
    const result = await query.selectAll().execute();

    // const urlCond = url ? `AND url = ${url}` : "";
    // const privacyCond = userId ? "" : `AND privacy = ${false}`;
    // // table 和 column 的名字都会被自动转换成小写
    // // 列名不能放在 ${} 里作为变量
    // const result =
    //   await prisma.$queryRaw`SELECT * FROM highlight WHERE author_id = ${userId} AND url = ${url}
    //                                       ORDER BY position->>'pageNumber' ASC, position->'boundingRect'->>'y1' ASC`;

    return NextResponse.json(result);
  },
  {
    params: joi.object({
      url: joi.string(),
      authorId: joi.string(),
    }),
  }
);

// 创建高亮
export const POST = apiHandler(
  async (req: NextRequest) => {
    const request = await req.json();
    const userId = req.headers.get('userId');

    const highlights = request.map((item: any) => {
      return {
        ...item,
        authorId: userId,
        id: undefined,
      };
    });

    await db.insertInto('Highlight').values(highlights).executeTakeFirst();

    // // const result = await prisma.highlight.create({
    // //   data: {
    // //     ...request,
    // //     authorId: session.user?.id,
    // //   },
    // // });

    // update 和 delete 操作会返回一个 bigint 类型的字段，表示影响的行数
    // 而 json 无法处理 bigint 类型，所以需要类型转换
    return NextResponse.json(highlights, { status: 201 });
  },
  {
    payload: joi.array().items(joiHighlight),
  }
);

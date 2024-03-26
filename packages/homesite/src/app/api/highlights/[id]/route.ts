import { NextRequest, NextResponse } from 'next/server';
// import prisma from "@/lib/prisma";
import db from '@/_lib/db/prisma';
import { apiHandler } from '@/_lib/http/api-handler';
import { joiContent, joiScaledPosition } from '@/_lib/http/joi';
import joi from 'joi';

// 删除高亮
export const DELETE = apiHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = params.id;
    const userId = req.headers.get('userId');

    // const result = await prisma.highlight.delete({
    //   where: {
    //     id: Number(id),
    //     authorId: userId,
    //   },
    // });

    await db
      .deleteFrom('Highlight')
      .where('id', '=', Number(id))
      .where('authorId', '=', userId)
      .executeTakeFirst();

    return NextResponse.json({});
  }
);

// 更新区域高亮的位置信息
export const PUT = apiHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const request = await req.json();
    const id = params.id;
    const userId = req.headers.get('userId');

    await db
      .updateTable('Highlight')
      .set({
        ...request,
      })
      .where('id', '=', Number(id))
      .where('authorId', '=', userId)
      .executeTakeFirst();

    // const result = await prisma.highlight.update({
    //   where: {
    //     id: Number(id),
    //     authorId: userId,
    //   },
    //   data: {
    //     ...request,
    //   },
    // });

    return NextResponse.json(request);
  },
  {
    payload: joi.object({
      content: joiContent,
      position: joiScaledPosition,
    }),
  }
);

import db from '@/_lib/db/prisma';
import { apiHandler } from '@/_lib/http/api-handler';
import joi from 'joi';
import { NextRequest, NextResponse } from 'next/server';

// 删除笔画
export const DELETE = apiHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = params.id;
    const userId = req.headers.get('userId');

    await db
      .deleteFrom('Stroke')
      .where('id', '=', Number(id))
      .where('authorId', '=', userId)
      .executeTakeFirst();

    return NextResponse.json({});
  },
  {
    params: joi.object({
      id: joi.string(),
    }),
  }
);

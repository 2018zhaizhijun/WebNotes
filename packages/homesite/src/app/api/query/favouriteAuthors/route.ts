import db from '@/_lib/db/prisma';
import { apiHandler } from '@/_lib/http/api-handler';
import { NextRequest, NextResponse } from 'next/server';

// 查询用户收藏的其他用户信息
export const GET = apiHandler(async (req: NextRequest) => {
  const userId = req.headers.get('userId');

  const result = await db
    .selectFrom('User')
    .select(['id', 'name', 'image'])
    .where(({ eb, selectFrom }) =>
      eb(
        'id',
        'in',
        selectFrom('FavouriteUser')
          .select('FavouriteUser.userId')
          .where('FavouriteUser.followerId', '=', userId)
      )
    )
    .execute();

  return NextResponse.json(result);
});

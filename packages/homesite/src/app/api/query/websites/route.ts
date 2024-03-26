import db from '@/_lib/db/prisma';
import { apiHandler } from '@/_lib/http/api-handler';
import joi from 'joi';
import { NextRequest, NextResponse } from 'next/server';

// 查询用户收藏或做了笔记的所有网站
export const GET = apiHandler(
  async (req: NextRequest) => {
    const authorId = req.nextUrl.searchParams.get('authorId');

    const result_favourite = await db
      .selectFrom('Website')
      .innerJoin(
        'FavouriteWebsite',
        'FavouriteWebsite.websiteUrl',
        'Website.url'
      )
      .select([
        'Website.id as id',
        'Website.url as url',
        'Website.title as title',
        'Website.abstract as abstract',
        'FavouriteWebsite.websiteRename as rename',
        'FavouriteWebsite.tag as tag',
      ])
      .where('FavouriteWebsite.followerId', '=', authorId)
      .execute();

    let query = db
      .selectFrom('Website')
      .where(({ eb, selectFrom }) =>
        eb(
          'url',
          'in',
          selectFrom('Highlight')
            .select('Highlight.url')
            .where('Highlight.authorId', '=', authorId)
        )
      );
    if (result_favourite.length > 0) {
      query = query.where(
        'url',
        'not in',
        result_favourite.map((w) => w.url)
      );
    }
    const result_highlight = await query.selectAll().execute();

    const result = {
      result_highlight,
      result_favourite,
    };

    return NextResponse.json(result);
  },
  {
    params: joi.object({
      authorId: joi.string().required(),
    }),
  }
);

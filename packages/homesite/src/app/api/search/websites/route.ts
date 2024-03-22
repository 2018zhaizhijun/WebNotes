import { NextRequest } from 'next/server';
import db from '@/lib/prisma';
import { Website } from 'common/db/types';
import { Overwrite } from 'common/db/prisma';

type WebsiteType = Array<Overwrite<Website, { id: number }>>;

export async function GET(req: NextRequest) {
  const url_regexp = req.nextUrl.searchParams
    .get('url_regexp')
    ?.replaceAll(' ', '%');
  const keyword_regexp = req.nextUrl.searchParams
    .get('keyword_regexp')
    ?.replaceAll(' ', '%');
  console.log('Search author info by ' + url_regexp + ', ' + keyword_regexp);

  // 分页查询
  const offset = Number(req.nextUrl.searchParams.get('offset') || 0);
  const num = 10;

  let url_result: WebsiteType = [];
  let keyword_result: WebsiteType = [];

  if (url_regexp) {
    url_result = await db
      .selectFrom('Website')
      .where('url', 'ilike', `%${url_regexp}%`)
      .selectAll()
      .execute();
  }

  if (keyword_regexp) {
    const keyword_result_title = await db
      .selectFrom('Website')
      .where('title', 'ilike', `%${keyword_regexp}%`)
      .selectAll()
      .execute();

    let query = db
      .selectFrom('Website')
      .where('abstract', 'ilike', `%${keyword_regexp}%`);
    if (keyword_result_title.length > 0) {
      query = query.where(
        'id',
        'not in',
        keyword_result_title.map((item) => item.id)
      );
    }
    const keyword_result_abstract = await query.selectAll().execute();

    keyword_result = keyword_result_title.concat(keyword_result_abstract);
  }

  return Response.json({
    url_result,
    keyword_result: keyword_result.slice(offset, offset + num),
    keyword_result_total: keyword_result.length,
  });
}

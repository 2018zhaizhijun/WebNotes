import { NextRequest } from 'next/server';
import db from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const regexp = req.nextUrl.searchParams.get('regexp');
  console.log('Search author info by ' + regexp);

  if (!regexp) {
    return Response.json([]);
  }

  const author_result = await db
    .selectFrom('User')
    .select(['id', 'name', 'image'])
    .where('name', 'ilike', `%${regexp}%`)
    .execute();

  return Response.json({
    author_result,
  });
}

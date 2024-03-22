import { getServerSession } from 'next-auth/next';
import { NextRequest } from 'next/server';
import { authOptions } from '@/api/auth/[...nextauth]/route';
// import prisma from "@/lib/prisma";
import { HTTP_CODE, responseFail, toObject } from 'common/utils/httpcode';
import db from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const userName = req.nextUrl.searchParams.get('name');
  console.log('Get user info of ' + userName);

  if (userName) {
    const result = await db
      .selectFrom('User')
      .where('name', '=', userName)
      .select(['id', 'name', 'image'])
      .execute();
    return Response.json(result);
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // validation session
  if (!userId) {
    return responseFail(HTTP_CODE.NOT_LOGGED);
  }

  const result = await db
    .selectFrom('User')
    .where('id', '=', userId)
    .selectAll()
    .execute();

  return Response.json(result);
}

export async function PUT(req: NextRequest) {
  const request = await req.json();
  console.log('Update userinfo: ');
  console.log(request);

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // validation session
  if (!userId) {
    return responseFail(HTTP_CODE.NOT_LOGGED);
  }

  const result = await db
    .updateTable('User')
    .set({
      ...request,
    })
    .where('id', '=', userId)
    .executeTakeFirst();

  return Response.json(toObject(result));
}

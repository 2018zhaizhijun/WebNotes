import { getServerSession } from 'next-auth/next';
import { NextRequest } from 'next/server';
import { authOptions } from '@/api/auth/[...nextauth]/route';
// import prisma from "@/lib/prisma";
import { HTTP_CODE, responseFail, toObject } from 'common/utils/httpcode';
import db from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  console.log('Get favourite info of ' + userId);

  const session = await getServerSession(authOptions);
  const followerId = session?.user?.id;

  // validation session
  if (!followerId) {
    return responseFail(HTTP_CODE.NOT_LOGGED);
  }

  let query = db
    .selectFrom('FavouriteUser')
    .where('followerId', '=', followerId);

  if (userId) {
    query = query.where('userId', '=', userId);
  }
  const result = await query.selectAll().execute();

  return Response.json(result);
}

export async function POST(req: NextRequest) {
  const request = await req.json();
  console.log('Post favourite info:');
  console.log(request);

  const session = await getServerSession(authOptions);
  const followerId = session?.user?.id;

  // validation session
  if (!followerId) {
    return responseFail(HTTP_CODE.NOT_LOGGED);
  }

  const result = await db
    .insertInto('FavouriteUser')
    .values({
      ...request,
      followerId: followerId,
    })
    .executeTakeFirst();

  return Response.json(toObject(result));
}

export async function PUT(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  const request = await req.json();
  console.log('Update favourite info:');
  console.log(request);

  const session = await getServerSession(authOptions);
  const followerId = session?.user?.id;

  // validation session
  if (!followerId) {
    return responseFail(HTTP_CODE.NOT_LOGGED);
  }

  const result = await db
    .updateTable('FavouriteUser')
    .set({
      ...request,
    })
    .where('followerId', '=', followerId)
    .where('userId', '=', userId)
    .executeTakeFirst();

  return Response.json(toObject(result));
}

export async function DELETE(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  console.log('Delete favourite info of ' + userId);

  const session = await getServerSession(authOptions);
  const followerId = session?.user?.id;

  // validation session
  if (!followerId) {
    return responseFail(HTTP_CODE.NOT_LOGGED);
  }

  const result = await db
    .deleteFrom('FavouriteUser')
    .where('followerId', '=', followerId)
    .where('userId', '=', userId)
    .executeTakeFirst();

  return Response.json(toObject(result));
}

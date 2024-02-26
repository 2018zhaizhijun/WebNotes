import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";
import { authOptions } from "@/api/auth/[...nextauth]/route";
// import prisma from "@/lib/prisma";
import { HTTP_CODE, responseFail, toObject } from "common/utils/httpcode";
import db from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const id = req.nextUrl.searchParams.get("id");
  console.log("Get website info of " + id + " " + url);

  //   const session = await getServerSession(authOptions);
  //   const userId = session?.user?.id;

  // validation session
  // if (!userId) {
  //   return responseFail(HTTP_CODE.NOT_LOGGED);
  // }

  let query = db.selectFrom("Website");

  if (url) {
    query = query.where("url", "=", url);
  } else {
    query = query.where("id", "=", Number(id));
  }

  const result = await query.selectAll().execute();

  return Response.json(result);
}

export async function POST(req: NextRequest) {
  const request = await req.json();
  console.log(request);

  //   const session = await getServerSession(authOptions);
  //   const userId = session?.user?.id;

  //   // validation session
  //   if (!userId) {
  //     return responseFail(HTTP_CODE.NOT_LOGGED);
  //   }

  const result = await db
    .insertInto("Website")
    .values({
      ...request,
    })
    .executeTakeFirst();

  return Response.json(toObject(result));
}

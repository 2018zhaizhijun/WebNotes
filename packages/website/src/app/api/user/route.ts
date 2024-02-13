import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";
import { authOptions } from "@/api/auth/[...nextauth]/route";
// import prisma from "@/lib/prisma";
import { HTTP_CODE, responseFail, toObject } from "@/lib/httpcode";
import db from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // validation session
  if (!userId) {
    return responseFail(HTTP_CODE.NOT_LOGGED);
  }

  let result = db
    .selectFrom("User")
    .where("id", "=", userId)
    .executeTakeFirst();

  return Response.json(result);
}

export async function PUT(req: NextRequest) {
  const request = await req.json();
  console.log("Update userinfo: ");
  console.log(request);

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // validation session
  if (!userId) {
    return responseFail(HTTP_CODE.NOT_LOGGED);
  }

  const result = await db
    .updateTable("User")
    .set({
      ...request,
    })
    .where("id", "=", userId)
    .executeTakeFirst();

  return Response.json(toObject(result));
}

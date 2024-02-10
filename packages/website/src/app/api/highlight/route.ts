import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";
import { authOptions } from "@/api/auth/[...nextauth]/route";
// import prisma from "@/lib/prisma";
import { HTTP_CODE, responseFail, toObject } from "@/lib/httpcode";
import db from "@/lib/prisma";
import { sql } from "kysely";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  console.log("Get highlights of " + url);

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // validation session
  // if (!userId) {
  //   return responseFail(HTTP_CODE.NOT_LOGGED);
  // }

  // const result = await prisma.highlight.findMany({
  //   where: {
  //     authorId: userId,
  //     url: url || undefined,
  //     privacy: userId ? undefined : false,
  //   },
  // });

  let query = db.selectFrom("Highlight");

  if (userId) {
    query = query.where("authorId", "=", userId); // Kysely is immutable, you must re-assign!
  } else {
    query = query.where("privacy", "=", false);
  }

  if (url) {
    query = query.where("url", "=", url);
  }

  query = query.orderBy(
    sql`position->>'pageNumber' ASC, position->'boundingRect'->>'y1' ASC`
  );
  const result = await query.selectAll().execute();

  // const urlCond = url ? `AND url = ${url}` : "";
  // const privacyCond = userId ? "" : `AND privacy = ${false}`;
  // // table 和 column 的名字都会被自动转换成小写
  // // 列名不能放在 ${} 里作为变量
  // const result =
  //   await prisma.$queryRaw`SELECT * FROM highlight WHERE author_id = ${userId} AND url = ${url}
  //                                       ORDER BY position->>'pageNumber' ASC, position->'boundingRect'->>'y1' ASC`;

  return Response.json(result);
}

export async function POST(req: NextRequest) {
  const request = await req.json();
  console.log("Post highlight:");
  console.log(request);

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // validation session
  if (!userId) {
    return responseFail(HTTP_CODE.NOT_LOGGED);
  }

  const result = await db
    .insertInto("Highlight")
    .values({
      ...request,
      authorId: userId.toString(),
    })
    .executeTakeFirst();

  // // const result = await prisma.highlight.create({
  // //   data: {
  // //     ...request,
  // //     authorId: session.user?.id,
  // //   },
  // // });

  // update 和 delete 操作会返回一个 bigint 类型的字段，表示影响的行数
  // 而 json 无法处理 bigint 类型，所以需要类型转换
  return Response.json(toObject(result));
}

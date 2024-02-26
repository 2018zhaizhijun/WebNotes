import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";
import { authOptions } from "@/api/auth/[...nextauth]/route";
// import prisma from "@/lib/prisma";
import { HTTP_CODE, responseFail, toObject } from "common/utils/httpcode";
import db from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  console.log("Get author info for website " + url);

  //   const session = await getServerSession(authOptions);
  //   const userId = session?.user?.id;

  // validation session
  // if (!userId) {
  //   return responseFail(HTTP_CODE.NOT_LOGGED);
  // }

  //   const authorId = await db
  //     .selectFrom("User")
  //     .select(["id"])
  //     .where("name", "=", author)
  //     .executeTakeFirst();

  if (!url) {
    return Response.json([]);
  }

  const result = await db
    .selectFrom("User")
    .select(["id", "name", "image"])
    .where(({ eb, selectFrom }) =>
      eb(
        "id",
        "in",
        selectFrom("Highlight")
          .select("Highlight.authorId")
          .where("Highlight.url", "=", url)
      )
    )
    .execute();

  return Response.json(result);
}

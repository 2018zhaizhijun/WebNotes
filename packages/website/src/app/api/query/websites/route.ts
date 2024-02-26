import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";
import { authOptions } from "@/api/auth/[...nextauth]/route";
// import prisma from "@/lib/prisma";
import { HTTP_CODE, responseFail, toObject } from "common/utils/httpcode";
import db from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authorId = req.nextUrl.searchParams.get("authorId");
  console.log("Get website info for " + authorId);

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

  if (!authorId) {
    return responseFail(HTTP_CODE.AUTHOR_NOT_FOUND);
  }

  const result_favourite = await db
    .selectFrom("Website")
    .innerJoin("FavouriteWebsite", "FavouriteWebsite.websiteUrl", "Website.url")
    .select([
      "Website.url as url",
      "Website.title as title",
      "Website.abstract as abstract",
      "FavouriteWebsite.websiteRename as rename",
      "FavouriteWebsite.tag as tag",
    ])
    .where("FavouriteWebsite.followerId", "=", authorId)
    .execute();

  const result_highlight = await db
    .selectFrom("Website")
    .selectAll()
    .where(({ eb, selectFrom }) =>
      eb(
        "url",
        "in",
        selectFrom("Highlight")
          .select("Highlight.url")
          .where("Highlight.authorId", "=", authorId)
      )
    )
    .where(
      "url",
      "not in",
      result_favourite.map((w) => w.url)
    )
    .execute();

  const result = {
    result_highlight,
    result_favourite,
  };

  return Response.json(result);
}

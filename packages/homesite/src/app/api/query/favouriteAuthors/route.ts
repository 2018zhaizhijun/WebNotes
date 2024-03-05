import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { HTTP_CODE, responseFail } from "common/utils/httpcode";
import db from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // validation session
  if (!userId) {
    return responseFail(HTTP_CODE.NOT_LOGGED);
  }

  const result = await db
    .selectFrom("User")
    .select(["id", "name", "image"])
    .where(({ eb, selectFrom }) =>
      eb(
        "id",
        "in",
        selectFrom("FavouriteUser")
          .select("FavouriteUser.userId")
          .where("FavouriteUser.followerId", "=", userId)
      )
    )
    .execute();

  return Response.json(result);
}

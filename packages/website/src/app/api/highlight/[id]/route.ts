import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";
import { authOptions } from "@/api/auth/[...nextauth]/route";
// import prisma from "@/lib/prisma";
import db from "@/lib/prisma";
import { HTTP_CODE, responseFail, toObject } from "@/lib/httpcode";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log("Delete highlights " + id);

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // validation session
  if (!userId) {
    return responseFail(HTTP_CODE.NOT_LOGGED);
  }

  // const result = await prisma.highlight.delete({
  //   where: {
  //     id: Number(id),
  //     authorId: userId,
  //   },
  // });

  const result = await db
    .deleteFrom("Highlight")
    .where("id", "=", Number(id))
    .where("authorId", "=", userId)
    .executeTakeFirst();

  return Response.json(toObject(result));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const request = await req.json();
  const id = params.id;
  console.log("Update highlight " + id);
  console.log(request);

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // validation session
  if (!userId) {
    return responseFail(HTTP_CODE.NOT_LOGGED);
  }

  const result = await db
    .updateTable("Highlight")
    .set({
      ...request,
    })
    .where("id", "=", Number(id))
    .where("authorId", "=", userId)
    .executeTakeFirst();

  // const result = await prisma.highlight.update({
  //   where: {
  //     id: Number(id),
  //     authorId: userId,
  //   },
  //   data: {
  //     ...request,
  //   },
  // });

  return Response.json(toObject(result));
}

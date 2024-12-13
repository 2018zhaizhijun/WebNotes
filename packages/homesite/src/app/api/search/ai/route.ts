import db from '@/_lib/db/prisma';
import { apiHandler } from '@/_lib/http/api-handler';
import VectorStore from 'common/db/vector';
import joi from 'joi';
import { sql } from 'kysely';
import { NextRequest, NextResponse } from 'next/server';
import { cosineDistance } from 'pgvector/kysely';

export const POST = apiHandler(
  async (req: NextRequest) => {
    const request = await req.json();
    const vector = await VectorStore.embed(request.query);

    // const ai_result = await db
    //   .selectFrom('pdf_vector')
    //   .selectAll()
    //   .orderBy(cosineDistance('vector', vector), 'desc')
    //   .orderBy(sql`metadata->>'url'`) // orderBy要包含distinctOn的列
    //   .distinctOn(sql`metadata->>'url'`)
    //   .limit(5)
    //   .execute();

    const ai_result = await db
      .selectFrom((eb) =>
        eb
          .selectFrom('pdf_vector')
          .selectAll()
          .distinctOn(sql`metadata->>'url'`)
          .orderBy(sql`metadata->>'url'`) // orderBy要包含distinctOn的列，而且需要放在第一位
          .orderBy(cosineDistance('vector', vector))
          .as('p')
      )
      .selectAll()
      .orderBy(cosineDistance('vector', vector))
      .limit(5)
      .execute();

    return NextResponse.json(
      {
        ai_result,
      },
      { status: 200 }
    );
  },
  {
    payload: joi.object({
      query: joi.string(),
    }),
  }
);

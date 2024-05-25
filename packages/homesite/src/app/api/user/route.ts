import db from '@/_lib/db/prisma';
import { apiHandler } from '@/_lib/http/api-handler';
import joi from 'joi';
import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/user:
 *   get:
 *     description: Get user information. If name is provided, return simplified information; otherwise, return full information
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: The user name
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 image:
 *                   type: string
 *                 email:
 *                   type: string
 *                 emailVerified:
 *                   type: string
 */
export const GET = apiHandler(
  async (req: NextRequest) => {
    const userName = req.nextUrl.searchParams.get('name');

    if (userName) {
      const result = await db
        .selectFrom('User')
        .where('name', '=', userName)
        .select(['id', 'name', 'image'])
        .execute();

      return NextResponse.json(result);
    }

    const userId = req.headers.get('userId');

    const result = await db
      .selectFrom('User')
      .where('id', '=', userId)
      .selectAll()
      .execute();

    return NextResponse.json(result);
  },
  {
    params: joi.object({
      name: joi.string(),
    }),
  }
);

/**
 * @swagger
 * /api/user:
 *   put:
 *     description: Update user information
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 image:
 *                   type: string
 */
export const PUT = apiHandler(
  async (req: NextRequest) => {
    const request = await req.json();
    const userId = req.headers.get('userId');

    await db
      .updateTable('User')
      .set({
        ...request,
      })
      .where('id', '=', userId)
      .executeTakeFirst();

    return NextResponse.json(request);
  },
  {
    payload: joi.object({
      name: joi.string(),
      image: joi.string(),
    }),
  }
);

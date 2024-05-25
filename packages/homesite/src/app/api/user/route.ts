import db from '@/_lib/db/prisma';
import { apiHandler } from '@/_lib/http/api-handler';
import joi from 'joi';
import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/user:
 *   get:
 *     description: Get user information. If id is provided, return full information; otherwise, return simplified information
 *     parameters:
 *       - name: id
 *         in: query
 *         schema:
 *           type: string
 *         description: The user id
 *       - name: name
 *         in: query
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
    const userId = req.nextUrl.searchParams.get('id');
    const userName = req.nextUrl.searchParams.get('name');

    let result;
    if (userId) {
      result = await db
        .selectFrom('User')
        .where('id', '=', userId)
        .selectAll()
        .execute();
    } else if (userName) {
      result = await db
        .selectFrom('User')
        .where('name', '=', userName)
        .select(['id', 'name', 'image'])
        .execute();
    }

    return NextResponse.json(result);
  },
  {
    params: joi.object({
      id: joi.string(),
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

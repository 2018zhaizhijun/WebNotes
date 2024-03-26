import { apiHandler } from '@/_lib/http/api-handler';
import axios from 'axios';
import joi from 'joi';
import { NextRequest, NextResponse } from 'next/server';

// 前端pdf请求由于cors问题无法正常访问时，通过服务器转发请求，获取pdf
export const GET = apiHandler(
  async (req: NextRequest) => {
    const url = req.nextUrl.searchParams.get('url');

    const result = await axios({
      method: 'get',
      url: url!,
      timeout: 10000,
      maxContentLength: Infinity,
      responseType: 'arraybuffer',
    });

    const arrayBuffer = Buffer.from(result.data, 'binary');

    return NextResponse.json({ arraybuffer: arrayBuffer });
  },
  {
    params: joi.object({
      url: joi.string().required(),
    }),
  }
);

import axios from 'axios';
import { NextRequest } from 'next/server';

// 前端pdf请求由于cors问题无法正常访问时，通过服务器转发请求
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  console.log('Get pdf data of ' + url);

  if (!url) {
    return Response.json(null);
  }

  const result = await axios({
    method: 'get',
    url,
    timeout: 10000,
    maxContentLength: Infinity,
    responseType: 'arraybuffer',
  });

  const arrayBuffer = Buffer.from(result.data, 'binary');

  return Response.json({ arraybuffer: arrayBuffer });
}

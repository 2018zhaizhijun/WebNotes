import { apiHandler } from '@/_lib/http/api-handler';
import axios from 'axios';
// import { createPDFAgent } from 'common/utils/agent';
// import { StringOutputParser } from '@langchain/core/output_parsers';
// import { ChatOpenAI } from '@langchain/openai';
// import { HttpsProxyAgent } from 'https-proxy-agent';
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

    // const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    // const loader = new WebPDFLoader(blob);
    // let docs = await loader.load();
    // // await createPDFAgent(docs);
    // docs = docs.map((doc) => {
    //   return {
    //     pageContent: doc.pageContent,
    //     metadata: {
    //       ...doc.metadata,
    //       url,
    //     },
    //   };
    // });

    // const agentManager = PDFAgentManager.getInstance();
    // agentManager.reset();
    // await agentManager.initialize();

    // let query = db.selectFrom('Website');
    // query = query.where('url', '=', url);
    // const website = await query.selectAll().executeTakeFirst();
    // if (!website) {
    //   await VectorStore.addDocuments(docs);
    // }

    return NextResponse.json({ arraybuffer: arrayBuffer });
  },
  {
    params: joi.object({
      url: joi.string().required(),
    }),
  }
);

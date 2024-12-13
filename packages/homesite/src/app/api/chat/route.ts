import { apiHandler } from '@/_lib/http/api-handler';
import PDFAgentManager from 'common/utils/agent';
import joi from 'joi';
import { NextRequest, NextResponse } from 'next/server';

export const POST = apiHandler(
  async (req: NextRequest) => {
    const request = await req.json();

    const agentManager = PDFAgentManager.getInstance();

    try {
      const response = await agentManager.chat(request.query);
      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('Chat error:', error);
    }
  },
  {
    payload: joi.object({
      query: joi.string(),
    }),
  }
);

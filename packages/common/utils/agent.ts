import { HumanMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { createRetrieverTool } from 'langchain/tools/retriever';
// import VectorStore from '../db/vector';
import { Document } from '@langchain/core/documents';
import { v4 as uuidv4 } from 'uuid';
import VectorStore from '../db/vector';

class PDFAgentManager {
  private static instance: PDFAgentManager;
  private agentExecutor: any = null;
  private outputParser: StringOutputParser = new StringOutputParser();
  private initialized = false;
  private thread_id = '';

  private constructor() {}

  public static getInstance(): PDFAgentManager {
    if (!PDFAgentManager.instance) {
      PDFAgentManager.instance = new PDFAgentManager();
    }
    return PDFAgentManager.instance;
  }

  public async initialize() {
    if (this.initialized) {
      console.log('Agent already initialized');
      return;
    }

    const memory = new MemorySaver();
    const model = new ChatOpenAI({
      model: 'gpt-4',
      configuration: {
        httpAgent: new HttpsProxyAgent(process.env.HTTP_PROXY || ''),
      },
    });

    // const textSplitter = new RecursiveCharacterTextSplitter({
    //   chunkSize: 1000,
    //   chunkOverlap: 200,
    // });

    // const splits = await textSplitter.splitDocuments(docs);

    // const vectorstore = await MemoryVectorStore.fromDocuments(
    //   splits,
    //   new OpenAIEmbeddings({
    //     configuration: {
    //       httpAgent: new HttpsProxyAgent(process.env.HTTP_PROXY || ''),
    //     },
    //   })
    // );

    // const retriever = vectorstore.asRetriever();

    const retriever = await VectorStore.getRetriever();

    const tool = createRetrieverTool(retriever, {
      name: 'article_retriever',
      description: 'Searches and returns excerpts from the article.',
    });

    this.agentExecutor = createReactAgent({
      llm: model,
      tools: [tool],
      checkpointSaver: memory,
    });

    this.thread_id = uuidv4();
    this.initialized = true;
  }

  public async chat(message: string) {
    if (!this.initialized) {
      // throw new Error('Agent not initialized. Please call initialize() first.');
      const agentManager = PDFAgentManager.getInstance();
      await agentManager.initialize();
    }

    const config = {
      version: 'v2',
      configurable: { thread_id: this.thread_id },
    };
    const eventStream = await this.agentExecutor.streamEvents(
      {
        messages: [new HumanMessage(message)],
      },
      config
    );

    let ref: Document[] = [];
    let msg = '';
    for await (const event of eventStream) {
      if (event.event === 'on_retriever_end') {
        // console.log(event.data.output);
        ref = ref.concat(event.data.output);
      } else if (event.event === 'on_chat_model_end') {
        msg = await this.outputParser.invoke(event.data.output);
        // console.log(msg);
      }
    }
    // const response = await this.agentExecutor.invoke(
    //   {
    //     messages: [new HumanMessage(message)],
    //   },
    //   config
    // );
    // console.log(response.messages);
    // const msg = await this.outputParser.invoke(
    //   response.messages[response.messages.length - 1]
    // );

    // return msg;
    return {
      reference: ref,
      message: msg,
    };
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public reset() {
    this.agentExecutor = null;
    this.initialized = false;
    this.thread_id = '';
  }
}

export default PDFAgentManager;

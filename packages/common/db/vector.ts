import {
  DistanceStrategy,
  PGVectorStore,
} from '@langchain/community/vectorstores/pgvector';
import { Document } from '@langchain/core/documents';
import { VectorStoreRetriever } from '@langchain/core/vectorstores';
import { OpenAIEmbeddings } from '@langchain/openai';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Pool } from 'pg';

class VectorStore {
  private static instance: PGVectorStore;
  private static retriever: VectorStoreRetriever<PGVectorStore>;
  private static embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
    configuration: {
      httpAgent: new HttpsProxyAgent(process.env.HTTP_PROXY || ''),
    },
  });

  private static reusablePool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
  });

  private static config = {
    pool: VectorStore.reusablePool,
    tableName: 'pdf_vector',
    columns: {
      idColumnName: 'id',
      vectorColumnName: 'vector',
      contentColumnName: 'content',
      metadataColumnName: 'metadata',
    },
    distanceStrategy: 'cosine' as DistanceStrategy,
  };

  private constructor() {}

  public static async getInstance(): Promise<PGVectorStore> {
    if (!VectorStore.instance) {
      await PGVectorStore.initialize(
        VectorStore.embeddings,
        VectorStore.config
      );
      VectorStore.instance = new PGVectorStore(
        VectorStore.embeddings,
        VectorStore.config
      );
      await VectorStore.instance.createHnswIndex({
        dimensions: 1536,
        efConstruction: 64,
        m: 16,
      });
    }
    return VectorStore.instance;
  }

  public static async getRetriever(
    filter: any = undefined,
    k = 5
  ): Promise<any> {
    if (!VectorStore.retriever) {
      const store = await VectorStore.getInstance();
      VectorStore.retriever = store.asRetriever({
        filter,
        k,
      });
    }
    return VectorStore.retriever;
  }

  public static async embed(query: string) {
    const embedding = await VectorStore.embeddings.embedQuery(query);
    return embedding;
  }

  // 插入文档向量
  public static async addDocuments(documents: Document<Record<string, any>>[]) {
    const store = await VectorStore.getInstance();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splits = await textSplitter.splitDocuments(documents);

    try {
      await store.addDocuments(splits);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  // 关闭数据库连接
  public static async closeConnection() {
    await VectorStore.reusablePool.end();
  }
}

export default VectorStore;

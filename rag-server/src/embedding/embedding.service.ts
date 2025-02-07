import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { AzureOpenAIEmbeddings } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma';
import { DocumentEmbedding, Prisma } from '@prisma/client';

@Injectable()
export class EmbeddingService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  loadDataFromPdf(file: Express.Multer.File) {
    const filePath = file.path;
    const loader = new PDFLoader(filePath);
    return loader.load();
  }

  async getChunks(file: Express.Multer.File) {
    const data = await this.loadDataFromPdf(file);

    const textSplitter = new RecursiveCharacterTextSplitter();
    return await textSplitter.splitDocuments(data);
  }

  getEmbeddingModel() {
    const embeddingModel = new AzureOpenAIEmbeddings({
      azureOpenAIApiEmbeddingsDeploymentName: this.configService.get<string>(
        'AZURE_EMBEDDING_DEPLOYMENT',
      ),
      azureOpenAIApiKey: this.configService.get<string>('API_KEY'),
      azureOpenAIApiInstanceName: this.configService.get<string>('INSTANCE'),
      azureOpenAIApiVersion: this.configService.get<string>(
        'AZURE_EMBEDDING_API_VERSION',
      ),
    });
    return embeddingModel;
  }

  getVectorStore(): PrismaVectorStore<DocumentEmbedding, any, any, any> {
    const embeddingModel = this.getEmbeddingModel();

    const vectorStore = PrismaVectorStore.withModel<DocumentEmbedding>(
      this.prismaService,
    ).create(embeddingModel, {
      prisma: Prisma,
      tableName: 'document_embeddings' as any,
      vectorColumnName: 'vector',
      columns: {
        content: PrismaVectorStore.ContentColumn,
        id: PrismaVectorStore.IdColumn,
        documentName: true,
      },
    });

    return vectorStore;
  }

  async insertEmbedded(file: Express.Multer.File) {
    const dataChunks = await this.getChunks(file);

    const vectorStore = this.getVectorStore();

    const createdDocuments = await Promise.all(
      await this.prismaService.$transaction(
        dataChunks.map((chunk) =>
          this.prismaService.documentEmbedding.create({
            data: {
              content: chunk.pageContent,
              documentName: file.originalname,
            },
          }),
        ),
      ),
    );
    await vectorStore.addModels(createdDocuments);

    return dataChunks.length;
  }

  async getSimilarDocs(userInput: string) {
    const vectorStore = this.getVectorStore();
    return await vectorStore.similaritySearch(userInput, 1);
  }
}

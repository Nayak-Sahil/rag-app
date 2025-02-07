import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

@Injectable()
export class EmbeddingService {
  constructor(private readonly prismaService: PrismaService) {}

  async insertEmbedded(file: Express.Multer.File) {
    const filePath = file.path;
    const loader = new PDFLoader(filePath);

    const textSplitter = new RecursiveCharacterTextSplitter();

    const chunks = await textSplitter.splitDocuments(await loader.load());
    const embeddings = await Promise.all(
      chunks.map((doc) => {
        return this.prismaService.documentEmbedding.create({
          data: {
            content: doc.pageContent,
            documentName: file.originalname,
          },
        });
      }),
    );

    return embeddings;
  }
}

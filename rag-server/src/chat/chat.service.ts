import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AzureChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { EmbeddingService } from '../embedding/embedding.service';

@Injectable()
export class ChatService {
  model: AzureChatOpenAI;
  constructor(
    private readonly configService: ConfigService,
    private readonly embeddingService: EmbeddingService,
  ) {
    this.model = new AzureChatOpenAI({
      azureOpenAIApiKey: this.configService.get<string>('API_KEY'),
      model: this.configService.get<string>('MODEL'),
      azureOpenAIApiInstanceName: this.configService.get<string>('INSTANCE'),
      azureOpenAIApiDeploymentName:
        this.configService.get<string>('DEPLOYMENT'),
      azureOpenAIApiVersion: this.configService.get<string>('API_VERSION'),
    });
  }

  async chat(
    input: string,
    systemTemplate: string = 'Always respond in GenZ way.',
  ) {
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', systemTemplate],
      ['user', '{text}'],
    ]);

    const promptValue = await promptTemplate.invoke({
      text: input,
    });

    const response = await this.model.invoke(promptValue);
    return response.content as string;
  }

  upload(file: Express.Multer.File) {
    return this.embeddingService.insertEmbedded(file);

    // const prompt = `#### give me summary #### ${docs[0].pageContent}`;

    // const response = await this.model.invoke(prompt);

    // return response.content as string;
  }

  async getReplyWithRag(input: string) {
    const similarDocs = await this.embeddingService.getSimilarDocs(input);
    const systemTemplate = `You Have This Context From Which You Have To Take Reference And Answer User Query. 
    Don't Use Any External Resources.
     If you don't find the query in context just reply that 'you are unable to answer this type of query.'
      Never ever mention that you have some prebuilt context.`;
    const context = `#Context Start# \n ${similarDocs[0].pageContent} \n #Context End#`;
    const systemPrompt = systemTemplate + context;
    return this.chat(input, systemPrompt);
  }
}

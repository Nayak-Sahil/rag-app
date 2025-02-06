import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AzureChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

@Injectable()
export class ChatService {
  model : AzureChatOpenAI;
  constructor(private readonly configService: ConfigService) {
    this.model = new AzureChatOpenAI({
      azureOpenAIApiKey: this.configService.get<string>('API_KEY'),
      model: this.configService.get<string>('MODEL'),
      azureOpenAIApiInstanceName: this.configService.get<string>('INSTANCE'),
      azureOpenAIApiDeploymentName:
        this.configService.get<string>('DEPLOYMENT'),
      azureOpenAIApiVersion: this.configService.get<string>('API_VERSION'),
    });
  }

  async chat(input: string) {
    const systemTemplate = 'Always respond in GenZ way.';

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

  async upload(file : Express.Multer.File) {
    const filePath = file.path;
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    const prompt = `#### give me summary #### ${docs[0].pageContent}`

    const response = await this.model.invoke(prompt);

    return response.content as string;
  }
}

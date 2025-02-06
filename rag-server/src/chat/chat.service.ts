import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AzureChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from "@langchain/core/prompts";


@Injectable()
export class ChatService {
  constructor(private readonly configService: ConfigService) {}

  show(message: string) {
    console.log(this.configService.get<string>('API_KEY'));
    return message;
  }

  async chat(input: string) {
    const systemTemplate = "Translate the following from English into {language}";


    const model = new AzureChatOpenAI({
      azureOpenAIApiKey: this.configService.get<string>('API_KEY'),
      model: 'gpt-4o',
      azureOpenAIApiInstanceName: 'ibc-2025',
      azureOpenAIApiDeploymentName: 'gpt-4o-interns-bootcamp-2025',
      azureOpenAIApiVersion: '2024-08-01-preview',
    });

    const response = await model.invoke([input]);
    return response.content as string;
  }
}

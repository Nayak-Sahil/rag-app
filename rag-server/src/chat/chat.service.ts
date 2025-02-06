import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatService {
  constructor(private readonly configService: ConfigService) {}

  show(message: string) {
    console.log(this.configService.get<String>('API_KEY'));
    return message;
  }
}

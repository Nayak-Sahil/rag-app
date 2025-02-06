import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  show(message: string) {
    return message;
  }
}

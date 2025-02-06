import { Controller, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // @Get('')
  // show(@Query('message') message: string) {
  //   return this.chatService.show(message);
  // }

  @Get('')
  chat(@Query('input') message: string) {
    return this.chatService.chat(message);
  }
}

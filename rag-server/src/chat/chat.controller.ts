import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('')
  chat(@Query('input') message: string) {
    return this.chatService.chat(message);
  }

  @Post('')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: './temp' }),
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.chatService.upload(file);
  }
}

import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from '../embedding/embedding.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ConfigService, PrismaService, EmbeddingService],
})
export class ChatModule {}

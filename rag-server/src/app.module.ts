import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { EmbeddingService } from './embedding/embedding.service';

@Module({
  imports: [ChatModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [PrismaService, EmbeddingService],
})
export class AppModule {}

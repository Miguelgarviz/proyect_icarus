import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PlayerController } from './player/player.controller';
import { PlayerService } from './player/player.service';
import { PlayerModule } from './player/player.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ConfigModule.forRoot(), PlayerModule],
  controllers: [AppController, PlayerController],
  providers: [AppService, PlayerService, PrismaService],
})
export class AppModule {}

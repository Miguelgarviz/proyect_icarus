import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PlayerService } from './player/player.service';
import { PlayerModule } from './player/player.module';
import { PrismaService } from './prisma.service';
import { LobbyModule } from './lobby/lobby.module';
import { GameModule } from './game/game.module';
import { StoreModule } from './store/store.module';
import { CardModule } from './card/card.module';

@Module({
  imports: [ConfigModule.forRoot(), PlayerModule, LobbyModule, GameModule, StoreModule, CardModule],
  controllers: [AppController],
  providers: [AppService, PlayerService, PrismaService],
})
export class AppModule {}

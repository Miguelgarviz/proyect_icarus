import { Module } from '@nestjs/common';
import { LobbyController } from './lobby.controller';
import { LobbyService } from './lobby.service';
import { PrismaService } from '../prisma.service';
import { PlayerService } from '../player/player.service';

@Module({
  controllers: [LobbyController],
  providers: [LobbyService, PrismaService, PlayerService]
})
export class LobbyModule {}

import { Module } from '@nestjs/common';
import { LobbyController } from './lobby.controller';
import { LobbyService } from './lobby.service';
import { PrismaService } from '../prisma/prisma.service';
import { PlayerService } from '../player/player.service';
import { PlayerModule } from '../player/player.module';
import { UserService } from '../user/user.service';
import { LobbyGateway } from './lobby.gateway';

@Module({
  imports: [PlayerModule],
  controllers: [LobbyController],
  providers: [LobbyService, PrismaService, PlayerService, UserService, LobbyGateway],
})
export class LobbyModule {}

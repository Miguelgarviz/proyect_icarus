import { forwardRef,Module } from '@nestjs/common';
import { LobbyController } from './lobby.controller';
import { LobbyService } from './lobby.service';
import { PrismaService } from '../prisma.service';
import { PlayerService } from '../player/player.service';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [PlayerModule],
  controllers: [LobbyController],
  providers: [LobbyService, PrismaService, PlayerService]
})
export class LobbyModule {}

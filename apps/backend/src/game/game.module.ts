import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PrismaService } from '../prisma.service';
import { LobbyService } from '../lobby/lobby.service';
import { ShipService } from '../ship/ship.service';
import { StorageService } from '../storage/storage.service';

@Module({
  imports: [],
  controllers: [GameController],
  providers: [GameService, PrismaService, LobbyService, ShipService, StorageService]
})
export class GameModule {}

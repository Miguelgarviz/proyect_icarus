import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PrismaService } from '../prisma/prisma.service';
import { LobbyService } from '../lobby/lobby.service';
import { ShipService } from '../ship/ship.service';
import { StorageService } from '../storage/storage.service';
import { PlayerService } from '../player/player.service';
import { TileService } from '../tile/tile.service';
import { TileModule } from '../tile/tile.module';
import { CardService } from '../card/card.service';

@Module({
  imports: [TileModule],
  controllers: [GameController],
  providers: [GameService, PrismaService, LobbyService, ShipService, StorageService, PlayerService, TileService, CardService],
  exports:[GameService]
})
export class GameModule {}

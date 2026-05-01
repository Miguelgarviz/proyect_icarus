import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { PrismaService } from '../prisma.service';
import { CardService } from '../card/card.service';
import { GameService } from '../game/game.service';

@Module({
  controllers: [StoreController],
  providers: [StoreService, PrismaService, CardService, GameService]
})
export class StoreModule {}

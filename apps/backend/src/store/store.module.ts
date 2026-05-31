import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { PrismaService } from '../prisma/prisma.service';
import { CardService } from '../card/card.service';
import { GameModule } from '../game/game.module';

@Module({
  imports:[GameModule],
  controllers: [StoreController],
  providers: [StoreService, PrismaService, CardService]
}) 
export class StoreModule {}

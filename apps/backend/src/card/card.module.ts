import { Module } from '@nestjs/common';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { PrismaService } from '../prisma/prisma.service';
import { DrillCardService } from '../drill-card/drill-card.service';

@Module({
  controllers: [CardController],
  providers: [CardService, PrismaService, DrillCardService],
})
export class CardModule {}

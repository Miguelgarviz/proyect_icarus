import { Module } from '@nestjs/common';
import { DrillCardController } from './drill-card.controller';
import { DrillCardService } from './drill-card.service';
import { PrismaService } from '../prisma/prisma.service';
import { CardModule } from '@backend/card/card.module';

@Module({
  controllers: [DrillCardController],
  providers: [DrillCardService, PrismaService],
})
export class DrillCardModule {}

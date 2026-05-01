import { Module } from '@nestjs/common';
import { DrillCardController } from './drill-card.controller';
import { DrillCardService } from './drill-card.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DrillCardController],
  providers: [DrillCardService, PrismaService]
})
export class DrillCardModule {}

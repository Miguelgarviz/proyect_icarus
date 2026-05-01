import { Module } from '@nestjs/common';
import { ShipController } from './ship.controller';
import { ShipService } from './ship.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ShipController],
  providers: [ShipService, PrismaService]
})
export class ShipModule {}

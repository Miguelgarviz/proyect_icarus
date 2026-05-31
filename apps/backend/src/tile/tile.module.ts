import { Module } from '@nestjs/common';
import { TileController } from './tile.controller';
import { TileService } from './tile.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TileController],
  providers: [TileService, PrismaService],
  exports: [TileModule]
})
export class TileModule {}

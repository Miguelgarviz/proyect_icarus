import { Module } from '@nestjs/common';
import { TileController } from './tile.controller';
import { TileService } from './tile.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TileController],
  providers: [TileService, PrismaService]
})
export class TileModule {}

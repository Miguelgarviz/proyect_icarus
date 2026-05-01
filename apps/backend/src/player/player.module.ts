import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { PrismaService } from '../prisma.service';
import { ShipService } from '../ship/ship.service';
@Module({
    imports:[],
    controllers:[PlayerController],
    providers:[PlayerService, PrismaService, ShipService],
})
export class PlayerModule {}

import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { Prisma } from '@backend/generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Module({
    imports:[],
    controllers:[PlayerController],
    providers:[PlayerService, PrismaService],
})
export class PlayerModule {}

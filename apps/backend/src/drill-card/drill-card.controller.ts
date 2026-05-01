import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { DrillCardService } from './drill-card.service';
import { DrillCard, Prisma } from '../generated/prisma/client';

@Controller('drill-card')
export class DrillCardController {
    constructor(
        private readonly drillCardService: DrillCardService
    ) {}

    @Get()
    async getDrillCards(): Promise<DrillCard[]> {
        return await this.drillCardService.getDrillCards();
    }

    @Get('/:id')
    async getDrillCardById(@Param('id') id: string):Promise<DrillCard | null> {
        return await this.drillCardService.getDrillCardById(Number(id));
    }

    @Get('/game/:gameId')
    async getDrillCardsByGame(@Param('gameId') gameId: string): Promise<DrillCard[]> {
        return await this.drillCardService.getDrillCardsByGame(Number(gameId));
    }
    
    @Post()
    async createDrillCard(@Body('gameId') gameId: number): Promise<void>{
        await this.drillCardService.createDrillCardsForGame(gameId);
    }
}

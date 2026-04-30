import { Controller, Get, Param, Put, Post, Body } from '@nestjs/common';
import { GameService } from './game.service';
import { Game, Prisma } from '../generated/prisma/browser';

@Controller('game')
export class GameController {
    constructor(
        private readonly gameService: GameService
    ) {}

    @Get('/:id')
    async getGame(@Param('id') id:string): Promise<Game | null> {
        return this.gameService.getGame({ id: Number(id) });
    }

    @Post()
    async createGame(@Body() gameData: Prisma.GameCreateInput): Promise<Game> {
        return this.gameService.createGame(gameData);
    }
    
}

import { Controller, Param, Get, Post, Body } from '@nestjs/common';
import { PlayerService } from './player.service';
import { Player } from '@backend/generated/prisma/client';

@Controller('api/v1/player')
export class PlayerController {
    constructor(
        private readonly playerService: PlayerService
    ) {}

    @Get('/:id')    
    async getPlayer( @Param('id') id: string ):Promise<Player | null> {
        return this.playerService.getPlayer({ id: Number(id) });
    }

    @Get()
    async getPlayers():Promise<Player[]> {
        return this.playerService.getPlayers({});
    }

    @Post()
    async createPlayer(@Body() playerData: {name: string, color: string, movement: number}):Promise<Player> {
        return this.playerService.createPlayer(playerData);
    }
}

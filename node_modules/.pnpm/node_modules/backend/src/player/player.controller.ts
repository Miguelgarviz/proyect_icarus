import { Controller, Param, Get, Post, Body, Put, Delete } from '@nestjs/common';
import { PlayerService } from './player.service';
import { Player } from '@backend/generated/prisma/client';

@Controller('player')
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

    @Get('/lobby/:lobbyId')
    async getPlayersInLobby( @Param('lobbyId') lobbyId: string ):Promise<Player[]> {
        return this.playerService.getPlayersInLobby(Number(lobbyId));
    }

    @Post()
    async createPlayer(@Body() playerData: {name: string, color: string, movement: number}):Promise<Player> {
        return this.playerService.createPlayer(playerData);
    }

    @Put('/:id')
    async updatePlayer(@Param('id') id:string , @Body() playerData: {name?: string, color?: string, movement?: number}):Promise<Player> {
        return this.playerService.updatePlayer({
            where: { id: Number(id) },
            data: playerData
        });
    }

    @Delete('/:id')
    async deletePlayer(@Param('id') id: string): Promise<Player> {
        return this.playerService.deletePlayer({ id: Number(id) });
    }
}

import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { Lobby, Prisma, Player } from '../generated/prisma/client';
import { PlayerService } from '../player/player.service';

@Controller('lobby')
export class LobbyController {
    constructor(
        private readonly lobbyService: LobbyService,
        private readonly playerService: PlayerService
    ) {}

    @Get('/:id')
    async getLobby( @Param('id') id: string ):Promise<Lobby | null> {
        return this.lobbyService.getLobby({ id: Number(id) });
    }

    @Get('players/:id')
    async getPlayersInLobby( @Param('id') id: string ):Promise<Player[] | null> {
        return this.lobbyService.getPlayersInLobby({ id: Number(id) });
    }

    @Post()
    async createLobby( @Body() lobbyData: Prisma.LobbyCreateInput ):Promise<Lobby> {
        return this.lobbyService.createLobby(lobbyData);
    }

    @Put('/:id')
    async updateLobby(@Param('id') id: string, @Body() lobbyData: Prisma.LobbyUpdateInput): Promise<Lobby> {
        return this.lobbyService.updateLobby({
            where: { id: Number(id) },
            data: lobbyData
        });
    }

    @Put('/:id/add-player')
    async addPlayerToLobby(@Param('id') id: string, @Body() playerData: { name: string; color: string, movement: number }): Promise<Lobby> {
        const newPlayer = await this.playerService.createPlayer(playerData);
        return this.lobbyService.addPlayerToLobby({
            where: { id: Number(id) },
            data: { playerId: newPlayer.id }
        });
    }
}

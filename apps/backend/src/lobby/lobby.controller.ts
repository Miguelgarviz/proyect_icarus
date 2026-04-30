import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { Lobby, Prisma, Player, Dificulty } from '../generated/prisma/client';
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

    @Put('/:id/change-dificulty')
    async changeLobbyDificulty(@Param('id') id: string, @Body() dificultyData: { dificulty: Dificulty }): Promise<Lobby> {
        return this.lobbyService.changeLobbyDificulty({
            where: { id: Number(id) },
            data: dificultyData
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

    @Put('/:id/remove-player')
    async removePlayerFromLobby(@Param('id') playerId: string): Promise<Lobby> {
        try{
        const lobby = await this.lobbyService.getLobbieFromPlayer(Number(playerId));

        await this.playerService.deletePlayer({ id: Number(playerId) });
        if (!lobby) {
            throw new NotFoundException(`No se encontró un lobby para el jugador ${Number(playerId)}`);
        }
        return this.lobbyService.removePlayerFromLobby({
            where: { id: lobby?.id },
            data: { playerId: Number(playerId) }
        });
        } catch (error: unknown) {
            throw new NotFoundException(`Error al eliminar el jugador ${Number(playerId)}: ${ (error as Error).message }`);
        }
    }

    @Put('/:id/difficulty')
    async updateLobbyDifficulty(@Param('id') id:string, @Body() difficulty: { difficulty: Dificulty }): Promise<Lobby> {
        return this.lobbyService.updateLobbyDifficulty({
            where: { id: Number(id) },
            data: difficulty
        });
    }
}

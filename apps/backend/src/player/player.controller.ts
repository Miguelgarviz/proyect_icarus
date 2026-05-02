import { Controller, Param, Get, Post, Body, Put, Delete } from '@nestjs/common';
import { PlayerService } from './player.service';
import { Player, Prisma } from '../generated/prisma/client';
import { ShipService } from '../ship/ship.service';
import { StorageService } from '../storage/storage.service';
@Controller('player')
export class PlayerController {
    constructor(
        private readonly playerService: PlayerService,
        private readonly shipService: ShipService,
        private readonly storageService: StorageService
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

    @Post('/:lobbyId/ship')
    async createShipToPlayer(@Param('lobbyId') lobbyId: string): Promise<void> {
        const players: Player[] = await this.playerService.getPlayersInLobby(Number(lobbyId));
        for (const player of players) {
            await this.shipService.createShip({
                player: { connect: { id: player.id } }
            });
        }
    }

    @Post('/:lobbyId/storage')
    async createStorageForPlayer(@Param('lobbyId') lobbyId: string): Promise<void> {
        const players: Player[] = await this.playerService.getPlayersInLobby(Number(lobbyId));
        if (players.length === 0) {
            throw new Error('No players found in the specified lobby');
        }
        for (const player of players) {
            await this.storageService.createStorage(Number(player.id));
        }
    }

}

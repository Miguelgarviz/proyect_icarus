import { Controller, Param, Get, Post, Body, Put, Delete } from '@nestjs/common';
import { PlayerService } from './player.service';
import { Player, Prisma, Ship, Storage } from '../generated/prisma/client';
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

    @Get('/:id/ship')
    async getPlayersShip(@Param('id') id: string):Promise<Ship|null>{
        const player = await this.playerService.getPlayer({id:Number(id)})
        if(!player || !player.shipId){
            return null
        }
        return this.shipService.getShipById(player.shipId)
    }

    @Get('/:id/storage')
    async getPlayersStorage(@Param('id') id: string):Promise<Storage|null>{
        const player = await this.playerService.getPlayer({id:Number(id)})
        if(!player || !player.storageId){
            return null
        }
        return this.storageService.getStorage(player.storageId)
    }
    @Post()
    async createPlayer(@Body() playerData: {name: string, color: string, movement: number}):Promise<Player> {
        return this.playerService.createPlayer(playerData);
    }

    @Post('/:lobbyId/ship')
    async createShipToPlayer(@Param('lobbyId') lobbyId: string): Promise<void> {
        const players: Player[] = await this.playerService.getPlayersInLobby(Number(lobbyId));
        const position = [{x: 0, y: 0},{x: 16, y: 0},{x: 10, y: 0},{x: 26, y: 0}]
        let i = 1
        for (const player of players) {
            await this.shipService.createShip({
                player: { connect: { id: player.id } },
                externalId: `initial_${i}`,
                positionX: position[i-1].x,
                positionY: position[i-1].y
            });
            i=i+1;
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

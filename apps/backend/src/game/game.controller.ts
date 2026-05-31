import { Controller, Get, Param, Put, Post, Body, NotFoundException } from '@nestjs/common';
import { GameService } from './game.service';
import { Game, Prisma, Ship, Storage } from '../generated/prisma/browser';
import { LobbyService } from '../lobby/lobby.service';
import { ShipService } from '../ship/ship.service';
import { StorageService } from '../storage/storage.service';
import { TileService } from '../tile/tile.service';
import { PlayerService } from '../player/player.service';
import { NotFoundError } from 'rxjs';

@Controller('game')
export class GameController {
    constructor(
        private readonly gameService: GameService,
        private readonly lobbyService: LobbyService,
        private readonly shipService: ShipService,
        private readonly storageService: StorageService,
        private readonly tileService: TileService,
        private readonly playerService: PlayerService
    ) {}

    @Get('/:id')
    async getGame(@Param('id') id:string): Promise<Game | null> {
        return this.gameService.getGame({ id: Number(id) });
    }

    @Post()
    async createGame(@Body() gameData: Prisma.GameCreateInput): Promise<Game> {
        return this.gameService.createGame(gameData);
    }
    
    @Get('/:id/players')
    async getPlayers(@Param('id') id:string) {
        const game = await this.gameService.getGame({ id: Number(id) });
        if (!game) {
            return [];
        }
        const players = await this.lobbyService.getPlayersInLobby({ id: Number(game.lobbyId) });
        return players;

    }

    @Get('/:id/ships')
    async getShips(@Param('id') id: string){
        const game = await this.gameService.getGame({ id: Number(id) });
        if (!game) {
            return [];
        }
        const players = await this.lobbyService.getPlayersInLobby({ id: Number(game.lobbyId) });

        let ships: Ship[] = [];

        for (const player of players){
            if(player.shipId){
                const ship = await this.shipService.getShipById(player.shipId)
                ship? ships.push(ship) : null
            }
        }
        return ships;
    }

    @Get('/:id/store')
    async getStore(@Param('id') id:string){
        const game = await this.gameService.getGame({ id: Number(id) })
        if(game && game.storeId){
            return await this.gameService.getStoreByGame(game.storeId)
        }else{
            return null;
        }
    }

    @Get('/:id/storages')
    async getStorage(@Param('id') id:string){
        const game = await this.gameService.getGame({ id: Number(id) });
        if (!game) {
            return [];
        }
        const players = await this.lobbyService.getPlayersInLobby({ id: Number(game.lobbyId) });

        let storages: Storage[] = [];
        for (const player of players){
            if(player.storageId){
                const storage = await this.storageService.getStorage(player.storageId)
                storage? storages.push(storage) : null
            }
        }
        return storages;
    }

    @Put('/:id/next-player')
    async nextPlayer(@Param('id') id:string, @Body() body: { currentPlayerId: number}) {
        return this.gameService.nextPlayer(Number(id), body.currentPlayerId);
    }

    @Put('/:id/move-player')
    async movePlayer(@Param('id') gameId: string, @Body('externalId') externalId: string){
        const game = await this.gameService.getGame({id: Number(gameId)});
        const endTile = await this.tileService.getTileByExternalId(externalId, Number(gameId));
        const player = await this.playerService.getPlayer({id: game.actualPlayerId!})
        const ship = await this.shipService.getShipById(player.shipId!)

        console.log(game)
        console.log(endTile)
        console.log(player)
        console.log(ship)
        const otherPlayers = await this.lobbyService.getPlayersInLobby({id:player.lobbyId!})
        otherPlayers.filter((p) => p.id !== player.id)
        console.log(otherPlayers)
        this.gameService.movePlayer(endTile, otherPlayers, player)
    }

    @Get('/:id/current-player')
    async getCurrentPlayer(@Param('id') gameId: string){
        const game = await this.gameService.getGame({id: Number(gameId)})
        return await this.playerService.getPlayer({id: game.actualPlayerId!})
    }
}

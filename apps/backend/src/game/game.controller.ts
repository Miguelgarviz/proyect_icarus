import { Controller, Get, Param, Put, Post, Body } from '@nestjs/common';
import { GameService } from './game.service';
import { Game, Prisma, Ship, Storage, CardType, Card, Store} from '../generated/prisma/browser';
import { LobbyService } from '../lobby/lobby.service';
import { ShipService } from '../ship/ship.service';
import { StorageService } from '../storage/storage.service';
import { TileService } from '../tile/tile.service';
import { PlayerService } from '../player/player.service';
import { CardService } from '../card/card.service';
import { StoreService } from '../store/store.service';

@Controller('game')
export class GameController {
    constructor(
        private readonly gameService: GameService,
        private readonly lobbyService: LobbyService,
        private readonly shipService: ShipService,
        private readonly storageService: StorageService,
        private readonly tileService: TileService,
        private readonly playerService: PlayerService,
        private readonly cardService: CardService,
        private readonly storeService: StoreService
    ) {}

    @Get('/:id')
    async getGame(@Param('id') id:string): Promise<Game | null> {
        return this.gameService.getGame({ id: Number(id) });
    }

    @Post()
    async createGame(@Body() gameData: Prisma.GameCreateInput): Promise<Game> {
        return this.gameService.createGame(gameData);
    }
    
    @Post('/:id/create-store')
    async createStore(@Param('id') gameId: string): Promise<Store> {
        const store= await this.storeService.createStore({numCards: 18});
        await this.cardService.createCardsForStore(store.id, 6, { type: CardType.TEMPORARY_PATCH, cost: 1 });
        await this.cardService.createCardsForStore(store.id, 3, { type: CardType.NEW_DRILL, cost: 2});
        await this.cardService.createCardsForStore(store.id, 3, { type: CardType.BACKUP_POWER, cost: 2});
        await this.cardService.createCardsForStore(store.id, 2, {type: CardType.SLINGSHOT, cost: 2});
        await this.cardService.createCardsForStore(store.id, 2, {type: CardType.ENHANCED_SCANNER, cost: 2});
        await this.cardService.createCardsForStore(store.id, 2, {type: CardType.ROCKET_THRUSTERS, cost: 2});
        await this.gameService.setGameStore({ id: Number(gameId) }, store.id);

        const cards = await this.cardService.getCardsByStore(store.id)
        const shuffledCards = await this.cardService.shuffleCardsWithSeed(cards, Number(gameId))

        for (let i = 0; i < 3; i++){
            await this.cardService.setCardToStorefront(shuffledCards[i])
        }
        
        return store;
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

    @Put('/:id/move-player')
    async movePlayer(@Param('id') gameId: string, @Body('externalId') externalId: string){
        const game = await this.gameService.getGame({id: Number(gameId)});
        const endTile = await this.tileService.getTileByExternalId(externalId, Number(gameId));
        const player = await this.playerService.getPlayer({id: game.actualPlayerId})

        const otherPlayers = await this.lobbyService.getPlayersInLobby({id:player.lobbyId!})
        otherPlayers.filter((p) => p.id !== player.id)
        this.gameService.movePlayer(endTile, otherPlayers, player)
    }

    @Get('/:id/current-player')
    async getCurrentPlayer(@Param('id') gameId: string){
        const game = await this.gameService.getGame({id: Number(gameId)})
        return await this.playerService.getPlayer({id: game.actualPlayerId})
    }

    @Put('/:id/next-turn')
    async nextTurn(@Param('id') gameId: string){
        const game = await this.gameService.getGame({id: Number(gameId)})
        const players = await this.playerService.getPlayersInLobby(game.lobbyId!)
        const actualPlayer = await this.playerService.getPlayer({id: game.actualPlayerId})

        const nextPlayer = players.find((p) => p.turnOrder === (actualPlayer.turnOrder + 1)% players.length)

        await this.gameService.nextPlayer(nextPlayer!, game)
        return players
    }

    @Get('/:id/players-cards')
    async getPlayersCards(@Param('id') gameId: string){
        const game = await this.gameService.getGame({id: Number(gameId)})
        return await this.cardService.getPlayerCards(game.actualPlayerId)
    }

    @Get('/:id/max-range')
    async calculateMaxRange(@Param('id') gameId: string){
        const game = await this.gameService.getGame({id: Number(gameId)})
        const player = await this.playerService.getPlayer({id: game.actualPlayerId})
        const ship = await this.shipService.getShipById(player.shipId!)

        const reachableTiles = await this.gameService.calculateMaxDistance(player,ship,Number(gameId))
        return reachableTiles.map((t) => t.externalId)
    }

    @Put('/:id/upgrade-ship')
    async upgradeShip(@Param('id') gameId: string, @Body('system') system: string){
        const game = await this.gameService.getGame({id: Number(gameId)})
        const player = await this.playerService.getPlayer({id: game.actualPlayerId })
        const ship = await this.shipService.getShipById(player.shipId!)
        const storage = await this.storageService.getStorage(player.storageId!)

        switch(system){
            case "drill":
                if(ship.externalId.includes("space_station") && ship.drill < 10 && storage.green >= 1) await this.gameService.upgradeDrill(ship, storage)
                break;
            case "shield":
                if(ship.externalId.includes("space_station") && ship.shield < 10 && storage.green >= 1) await this.gameService.upgradeShield(ship, storage)
                break;
            case "engine":
                if(ship.externalId.includes("space_station") && ship.drill < 5 && storage.red >= 1 && !ship.engineUpgraded) await this.gameService.upgradeEngine(ship, storage)
                break;
            default: 
                console.log("Valor system no valido")
        }
    }

    @Put('/:id/change-minerals')
    async changeMinerals(@Param('id') gameId: string, @Body('system') system: string){
        const game = await this.gameService.getGame({id: Number(gameId)})
        const player = await this.playerService.getPlayer({id: game.actualPlayerId })
        const storage = await this.storageService.getStorage(player.storageId!)
        const ship = await this.shipService.getShipById(player.shipId!)

        switch(system){
            case "green-to-red":
                if(ship.externalId.includes("space_station") && storage.green>=7 && storage.red<10) await this.gameService.changeMineralsGreenToRed(storage)
                break;
            case "red-to-green":
                if(ship.externalId.includes("space_station") && storage.red>=1 && storage.green<18) await this.gameService.changeMineralsRedToGreen(storage)
                break;
            case "red-to-yellow":
                if(ship.externalId.includes("space_station") && storage.red>=5 && storage.yellow<10) await this.gameService.changeMineralsRedToYellow(storage)
                break;
            case "yellow-to-red":
                if(ship.externalId.includes("space_station") && storage.yellow>=1 && storage.red<10) await this.gameService.changeMineralsYellowToRed(storage)
                break;
            default:
                console.log("Valor system no valido")
        }
    }

    @Get('/:id/store-cards')
    async getStoreCards(@Param('id') gameId: string){
        const game = await this.gameService.getGame({id: Number(gameId)})
        const store = await this.storeService.getStore({id: game.storeId!})
        return await this.cardService.getStorefrontCards(store)

    }

    @Put('/:id/buy-card')
    async buyStoreCard(@Param('id') gameId: string, @Body('cardId') cardId: number){
        const game = await this.gameService.getGame({id: Number(gameId)})
        const store = await this.storeService.getStore({id: game.storeId!})
        const card = await this.cardService.getCard({id: cardId})
        const player = await this.playerService.getPlayer({id: game.actualPlayerId})
        const storage = await this.storageService.getStorage(player.storageId!)
        const ship = await this.shipService.getShipById(player.shipId!)
        const playerCards = await this.cardService.getPlayerCards(player.id)

        if(card.inFrontStore && storage.red>=card.cost && ship.externalId.includes("space_station") && playerCards.length<3){
            await this.cardService.buyCard(card,player,storage,store)
            if(store.numCards>0){
                const cards = await this.cardService.getCardsByStore(store.id)
                const shuffledCards = await this.cardService.shuffleCardsWithSeed(cards, Number(gameId))

                await this.cardService.setCardToStorefront(shuffledCards[0])
            }
        }

    }
}

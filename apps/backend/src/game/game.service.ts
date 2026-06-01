import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Game, Tile, Ship, Player, Storage } from '@backend/generated/prisma/client';
import { TileService } from '../tile/tile.service';

const spaceStationLandings: Record<string, string[]> = {
    "space_station_1": ["void_16"],
    "space_station_2": ["red_planet_1"],
    "space_station_3": ["void_17"],
    "space_station_4": ["void_19"],
    "space_station_5": ["void_20"],
    "space_station_6": ["void_21"],
    "space_station_7": ["void_3"],
    "space_station_8": ["space_station_3", "void_24"],
    "space_station_9": ["void_10", "void_25"],
    "space_station_10": ["green_planet_7", "void_22"],
    "space_station_11": ["green_planet_8"],
    "space_station_12": ["red_planet_3"],
};

@Injectable()
export class GameService {
    constructor(
        private prisma: PrismaService,
        private tileService: TileService
    ) {}
    

    async getGame(gameWhereUniqueInput: Prisma.GameWhereUniqueInput){
        return this.prisma.game.findUniqueOrThrow({
            where: gameWhereUniqueInput
        });
    }
    
    async createGame(data: Prisma.GameCreateInput) {
        return this.prisma.game.create({
            data:{
                lobby:{
                    connect: { id: Number(data.lobby) }
                },
                actualPlayerId: data.actualPlayerId
            }
        });
    }

    async updateGame(params: {
        where: Prisma.GameWhereUniqueInput;
        data: Prisma.GameUpdateInput;
    }) {
        const { where, data } = params;
        return this.prisma.game.update({
            data,
            where
        }); 
    }

    async setGameStore(where: Prisma.GameWhereUniqueInput, storeId: number) {
        return this.prisma.game.update({
            where: where,
            data: {
                storeId:storeId
            }
        });
    }

    async getStoreByGame(storeId: number){
        return this.prisma.store.findUniqueOrThrow({
            where:{
                id:storeId
            }
        })
    }
    
    async movePlayer(tile: Tile, otherPlayers: Player[], actualPlayer: Player){
        let distance = 0
        let validMove = false
        const ship = await this.getShipsFromPlayer(actualPlayer)
        if(tile.positionY === ship.positionY){
            const start = {x:ship.positionX!,y:ship.positionY!}
            const end = {x:tile.positionX!, y: tile.positionY!}
            distance = await this.calculateDistance(start, end)
            distance = distance + await this.calculateNumberOfPlayersBetween(start, end, distance, otherPlayers)
            validMove = distance <= actualPlayer.movement;
        }else if(ship.externalId.includes("space_station") && spaceStationLandings[ship.externalId] && spaceStationLandings[ship.externalId][tile.positionY === 1 ? 0 : tile.positionY === 0 ? 0 : 1]){
            
            const startTile = await this.tileService.getTileByExternalId(spaceStationLandings[ship.externalId!][tile.positionY === 1 ? 0 : tile.positionY === 0 ? 0 : 1], tile.gameId!)
            const start = {x:startTile.positionX!,y:startTile.positionY!}
            const end = {x:tile.positionX!, y: tile.positionY!}
            distance = await this.calculateDistance(start, end) + 1;
            distance = distance + await this.calculateNumberOfPlayersBetween(start, end, distance, otherPlayers)
            validMove = distance <= actualPlayer.movement;
        }
        
        if(validMove){
            await this.prisma.ship.update({
                where:{id: ship.id},
                data: {
                    positionX: tile.positionX,
                    positionY: tile.positionY,
                    externalId: tile.externalId
                }
            })
            await this.prisma.player.update({
                where: {id: actualPlayer.id},
                data: {
                    movement: actualPlayer.movement-distance
                }
            })
        }
    }

    async calculateDistance(start:{x:number, y: number}, end:{x:number, y: number}){
        const maxPlanetNum = [32, 16, 10];
        const distance1 = Math.abs(start.x - end.x);
        const distance2 =
            start.x > end.x
            ? end.x + (maxPlanetNum[end.y] - start.x)
            : start.x + (maxPlanetNum[end.y] - end.x);
    return Math.min(distance1, distance2);
    }

    async calculateNumberOfPlayersBetween(start: { x: number, y: number }, end: { x: number, y: number }, distance: number, otherPlayers: Player[]) {
        if (distance === 1) return 0;

        let numPlayers = 0;

        for (const p of otherPlayers) {
            const ship = await this.getShipsFromPlayer(p);
            if (ship.positionY !== start.y) continue;

            const playerToShip = Math.abs(ship.positionX! - start.x);
            const playerToDestiny = Math.abs(ship.positionX! - end.x);

            if (playerToShip < distance && playerToDestiny < distance) {
                numPlayers++;
            }
        }

        return numPlayers;
    }

    async getShipsFromPlayer(player: Player){
        return this.prisma.ship.findUniqueOrThrow({
            where:{id: player.shipId!}
        })
    }

    async nextPlayer(player: Player, game: Game){
        const ship = await this.getShipsFromPlayer(player)
        await this.prisma.player.update({
            where: {id: player.id},
            data:{
                movement: ship.engine
            }
        })
        await this.prisma.game.update({
            where:{id: game.id},
            data:{
                actualPlayerId: player.id
            }
        })
        await this.prisma.ship.update({
            where: {id: ship.id},
            data: {
                engineUpgraded: false
            }
        })
    }

    async calculateMaxDistance(player: Player, ship: Ship, gameId: number){
        const maxPlanetNum = [32, 16, 10];
        const distOrbit: Record<number, number[]> = {};

        let dir1 = ship.positionX - player.movement;
        if (dir1 < 0) dir1 = dir1 + maxPlanetNum[ship.positionY];

        const dir2 = (ship.positionX + player.movement) % maxPlanetNum[ship.positionY];

        const reachableTiles: Tile[] = [];
        let numTile = 0;

        for (let i = 0; i < player.movement * 2 + 1; i++) {
            numTile = (dir1 + i) % maxPlanetNum[ship.positionY];
            if(numTile !== ship.positionX){
                const tile = await this.tileService.getTilesByCoordinates(gameId, numTile, ship.positionY)
                if (tile) reachableTiles.push(tile);
            }
        }

        distOrbit[ship.positionY] = [dir1, dir2];

        if (ship.externalId.includes("space_station")) {
            const landingTilesId = spaceStationLandings[ship.externalId];
            for (const landingTileId of landingTilesId) {
                const tile = await this.tileService.getTileByExternalId(landingTileId, gameId)
                if (tile) {
                    const tileY = tile.positionY;
                    let dir3 = tile.positionX - player.movement + 1;
                    if (dir3 < 0) dir3 = dir3 + maxPlanetNum[tileY];
                    const dir4 = (tile.positionX + player.movement - 1) % maxPlanetNum[tileY];
                    distOrbit[tileY] = [dir3, dir4];
                    let numTile2 = 0;
                    for (let i = 0; i < player.movement * 2 - 1; i++) {
                        numTile2 = (dir3 + i) % maxPlanetNum[tileY];
                        const otherTile = await this.tileService.getTilesByCoordinates(gameId, numTile2, tileY)
                        if (otherTile){
                            reachableTiles.push(otherTile);
                        }     
                    }
                }
            };
        }
        return reachableTiles;
    }

    async upgradeShield(ship: Ship, storage: Storage){
        await this.prisma.ship.update({
            where:{
                id: ship.id
            },
            data:{
                shield:{increment: 1}
            }
        })
        await this.prisma.storage.update({
            where: {id: storage.id},
            data: {green: {decrement: 1}}
        })
    }

    async upgradeDrill(ship: Ship, storage: Storage){
        await this.prisma.ship.update({
            where:{
                id: ship.id
            },
            data:{
                drill:{increment: 1}
            }
        })
        await this.prisma.storage.update({
            where: {id: storage.id},
            data: {green: {decrement: 1}}
        })
    }
    async upgradeEngine(ship: Ship, storage: Storage){
        await this.prisma.ship.update({
            where:{
                id: ship.id
            },
            data:{
                engine:{increment: 1},
                engineUpgraded: true
            }
        })
        await this.prisma.storage.update({
            where: {id: storage.id},
            data: {red: {decrement: 1}}
        })
    }

    async changeMineralsGreenToRed(storage: Storage){
        await this.prisma.storage.update({
            where:{id:storage.id},
            data:{
                green: {decrement:7},
                red: {increment: 1}
            }
        })
    }
    async changeMineralsRedToGreen(storage: Storage){
        await this.prisma.storage.update({
            where:{id:storage.id},
            data:{
                green: (storage.green + 5 <= 18)?{increment:5}:18,
                red: {decrement: 1}
            }
        })
    }
    async changeMineralsRedToYellow(storage: Storage){
        await this.prisma.storage.update({
            where:{id:storage.id},
            data:{
                red: {decrement: 5},
                yellow: {increment: 1}
            }
        })
    }
    async changeMineralsYellowToRed(storage: Storage){
        await this.prisma.storage.update({
            where:{id:storage.id},
            data:{
                red: (storage.red + 3 > 10)?{increment: 3}:10,
                yellow: {decrement: 1}
            }
        })
    }

}

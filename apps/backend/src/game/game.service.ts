import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Game, Tile, Ship, Player } from '@backend/generated/prisma/client';
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

    async nextPlayer(gameId: number, currentPlayerId: number){
        return this.prisma.game.update({
            where: {id: gameId},
            data: {
                actualPlayerId: currentPlayerId
            }
        })
    }
    
    async movePlayer(tile: Tile, otherPlayers: Player[], actualPlayer: Player){
        let distance = 0
        let validMove = false
        const ship = await this.getShipsFromPlayer(actualPlayer)
        console.log("Entramos en la función")
        console.log(ship.externalId!)
        console.log("Landing", spaceStationLandings[ship.externalId!])
        if(tile.positionY === ship.positionY){
            console.log("Misma Y")
            const start = {x:ship.positionX!,y:ship.positionY!}
            const end = {x:tile.positionX!, y: tile.positionY!}
            distance = await this.calculateDistance(start, end)
            console.log("Distancia", distance)
            distance = distance + await this.calculateNumberOfPlayersBetween(start, end, distance, otherPlayers)
            validMove = distance <= actualPlayer.movement;
        }else if(ship.externalId!.includes("space_station") && spaceStationLandings[ship.externalId!]){
            console.log("Distinta Y")
            
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
}

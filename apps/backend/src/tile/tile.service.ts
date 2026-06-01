import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Tile, TileType } from '../generated/prisma/client';

@Injectable()
export class TileService {
    constructor(
        private prisma: PrismaService
    ){}

    async getTileById(id: number){
        return await this.prisma.tile.findUniqueOrThrow({
            where: {
                id: id
            }
        });
    }

    async createTiles(externalId: string[], type: TileType, coordinates: {x: number, y: number}[], gameId: number): Promise<void> {
        let drillAttempts = 0;
        switch (type){
            case TileType.GREEN:
                drillAttempts = 3
                break;
            case TileType.RED:
                drillAttempts = 2
                break;
            case TileType.YELLOW:
                drillAttempts = 1
                break;
            default:
                break;
        }
        for (let i = 0; i < externalId.length; i++) {
            await this.prisma.tile.create({
                data: {
                    externalId: externalId[i],
                    type: type,
                    
                    positionX: coordinates[i].x,
                    positionY: coordinates[i].y,
                    gameId: gameId,
                    drillAttempts: drillAttempts

                }
            });
        }
    }

    async getTileByExternalId(externalId: string, gameId: number){
        return await this.prisma.tile.findUniqueOrThrow({
            where: {
                externalId_gameId:{
                    externalId: externalId,
                    gameId: gameId
                }
            }
        });
    }

    async getTilesByCoordinates(gameId: number, x: number, y: number){
        return await this.prisma.tile.findUniqueOrThrow({
            where: {
                positionX_positionY_gameId:{
                    gameId: gameId,
                    positionX: x,
                    positionY: y
                }
            }
        });
    }

    async getTilesByGameId(gameId: number): Promise<Tile[]> {
        return await this.prisma.tile.findMany({
            where: {
                gameId: gameId
            }
        });
    }

    async decreaseDrillAttempts(id: number){
        return await this.prisma.tile.update({
            where: { id },
            data: {
                drillAttempts: { decrement: 1 }
            }
        });
    }

    async resetDrillAttempts(gameId: number){
        const tiles = await this.prisma.tile.findMany({
            where: {
                gameId: gameId
            }
        });
        for (const tile of tiles) {
            let drillAttempts = 0;
            switch (tile.type){
                case TileType.GREEN:
                    drillAttempts = 3;
                    break;
                case TileType.RED:
                    drillAttempts = 2;
                    break;
                case TileType.YELLOW:
                    drillAttempts = 1;
                    break;
                default:
                    break;
            }
            
            await this.prisma.tile.update({
                where: { id: tile.id },
                data: { drillAttempts: drillAttempts
                 }
            });
        }
    }

    async isTileOccupied(gameId: number, x: number, y: number){
        const tile = await this.prisma.tile.findUniqueOrThrow({
            where: {
                positionX_positionY_gameId:{
                    gameId: gameId,
                    positionX: x,
                    positionY: y
                }            }
        });
        return tile.ocupiedByPlayerId;
    }
}

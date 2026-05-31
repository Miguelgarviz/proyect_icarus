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
        for (let i = 0; i < externalId.length; i++) {
            await this.prisma.tile.create({
                data: {
                    externalId: externalId[i],
                    type: type,
                    
                    positionX: coordinates[i].x,
                    positionY: coordinates[i].y,
                    gameId: gameId
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

}

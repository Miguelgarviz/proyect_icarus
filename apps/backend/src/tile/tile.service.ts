import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Tile, TileType } from '../generated/prisma/client';

@Injectable()
export class TileService {
    constructor(
        private prisma: PrismaService
    ){}

    async getTileById(id: number): Promise<Tile | null> {
        return await this.prisma.tile.findUnique({
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
}

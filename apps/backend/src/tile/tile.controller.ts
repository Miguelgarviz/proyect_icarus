import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { TileService } from './tile.service';
import { TileType } from '../generated/prisma/enums';
import { externalIdsGreen, externalIdsRed, externalIdsYellow, externalIdsInitial, externalIdsStation, externalIdsVoid } from './tileData';
import { coordinatesGreen, coordinatesRed, coordinatesYellow, coordinatesSpaceStation, coordinatesInitial, coordinatesVoid } from './tileData';

@Controller('tile')
export class TileController {
    constructor(
        private readonly tileService: TileService
    ){}

    @Get('/:id')
    async getTileById(@Param('id') id: string) {
        return this.tileService.getTileById(Number(id));
    }

    @Post("/:gameId/game")
    async createTiles(@Param('gameId') gameId: string):Promise<void> {
        this.tileService.createTiles(externalIdsGreen, TileType.GREEN, coordinatesGreen, Number(gameId));
        this.tileService.createTiles(externalIdsRed, TileType.RED, coordinatesRed, Number(gameId));
        this.tileService.createTiles(externalIdsYellow, TileType.YELLOW, coordinatesYellow, Number(gameId));
        this.tileService.createTiles(externalIdsStation, TileType.SPACE_STATION, coordinatesSpaceStation, Number(gameId));
        this.tileService.createTiles(externalIdsInitial, TileType.START, coordinatesInitial, Number(gameId));
        this.tileService.createTiles(externalIdsVoid, TileType.EMPTY, coordinatesVoid, Number(gameId));
    }

    @Get('/:gameId/externalId/:externalId')
    async getTileByExternalId(@Param('gameId') gameId: string, @Param('externalId') externalId: string) {
        return this.tileService.getTileByExternalId(externalId, Number(gameId));
    }

    @Get('/:gameId/coordinates')
    async getTileByCoordinates(@Param('gameId') gameId: string, @Query('x') coordX: number, @Query('y') coordY: number){
        return this.tileService.getTilesByCoordinates(Number(gameId), coordX, coordY);
    }

    @Get('/game/:gameId')
    async getTilesByGameId(@Param('gameId') gameId: string) {
        return this.tileService.getTilesByGameId(Number(gameId));
    }
}

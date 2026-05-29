import { Controller, Body, Post, Get, Put, Param } from '@nestjs/common';
import { ShipService } from './ship.service';
import { Prisma, Ship } from '../generated/prisma/browser';

@Controller('ship')
export class ShipController {
    constructor(private readonly shipService: ShipService) {}

    @Post()
    async createShip(@Body() shipData: Prisma.ShipCreateInput): Promise<Ship> {
        return await this.shipService.createShip(shipData);
    }

    @Get()
    async getShips(): Promise<Ship[]> {
        return await this.shipService.getShips();
    }

    @Get(':id')
    async getShipById(@Body('id') id: number): Promise<Ship | null> {
        return await this.shipService.getShipById(id);
    }

    @Put('/:id/move')
    async moveShip(@Param('id') id: string, @Body('newX') newX: number, @Body('newY') newY: number, @Body('externalId') externalId: string): Promise<Ship> {
        return await this.shipService.moveShip(Number(id), newX, newY, externalId);
    }
}

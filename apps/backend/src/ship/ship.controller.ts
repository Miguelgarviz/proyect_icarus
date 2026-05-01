import { Controller, Body, Post, Get } from '@nestjs/common';
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
}

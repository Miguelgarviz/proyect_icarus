import { Controller, Body, Post, Get, Put, Param } from '@nestjs/common';
import { ShipService } from './ship.service';
import { Prisma, Ship } from '../generated/prisma/browser';

@Controller('ship')
export class ShipController {
    constructor(private readonly shipService: ShipService) {}

    @Get()
    async getShips(): Promise<Ship[]> {
        return await this.shipService.getShips();
    }

    @Get('/:id')
    async getShipById(@Param('id') id: string): Promise<Ship> {
        return await this.shipService.getShipById(Number(id));
    }
}

import { Prisma, Ship } from '../generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ShipService {
    constructor(private prisma: PrismaService) {}

    async createShip(shipData: Prisma.ShipCreateInput): Promise<Ship> {
        return this.prisma.ship.create({
            data: shipData
        });
    }

    async getShips(): Promise<Ship[]> {
        return this.prisma.ship.findMany();
    }

    async getShipById(id: number): Promise<Ship | null> {
        return this.prisma.ship.findUnique({
            where: { id }
        });
    }
}

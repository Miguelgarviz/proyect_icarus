import { Prisma, Ship } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
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

    async getShipById(id: number) {
        return this.prisma.ship.findUniqueOrThrow({
            where: { id }
        });
    }

    async moveShip(id: number, newX: number, newY: number, externalId: string): Promise<Ship> {
        return this.prisma.ship.update({
            where: { id },
            data: {
                positionX: newX,
                positionY: newY,
                externalId: externalId
            }
        });
    }

}

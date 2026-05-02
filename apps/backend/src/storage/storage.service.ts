import { PrismaService } from '../prisma.service';
import { Prisma, Storage } from '../generated/prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
    constructor(private prisma: PrismaService) {}

    async createStorage(playerId: number): Promise<Storage> {
        return await this.prisma.storage.create({
            data: {
                player: { connect: { id: playerId } }
            }
        });
    }
}

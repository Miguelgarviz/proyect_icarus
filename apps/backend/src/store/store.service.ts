import { Prisma, Store } from '../generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StoreService {
    constructor(private prisma: PrismaService) {}

    async createStore(data: Prisma.StoreCreateInput): Promise<Store> {
        return this.prisma.store.create({
            data
        });
    }

    async getStore(storeWhereUniqueInput: Prisma.StoreWhereUniqueInput): Promise<Store | null> {
        return this.prisma.store.findUnique({
            where: storeWhereUniqueInput
        });
    }

    
}

import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@backend/generated/prisma/client';

@Injectable()
export class GameService {
    constructor(private prisma: PrismaService) {}

    async getGame(gameWhereUniqueInput: Prisma.GameWhereUniqueInput){
        return this.prisma.game.findUnique({
            where: gameWhereUniqueInput
        });
    }
    
    async createGame(data: Prisma.GameCreateInput) {
        return this.prisma.game.create({
            data:{
                lobby:{
                    connect: { id: Number(data.lobby) }
                },
                actualPlayerId: data.actualPlayerId
            }
        });
    }

    async updateGame(params: {
        where: Prisma.GameWhereUniqueInput;
        data: Prisma.GameUpdateInput;
    }) {
        const { where, data } = params;
        return this.prisma.game.update({
            data,
            where
        }); 
    }

    async setGameStore(where: Prisma.GameWhereUniqueInput, storeId: number) {
        return this.prisma.game.update({
            where: where,
            data: {
                storeId:storeId
            }
        });
    }
}

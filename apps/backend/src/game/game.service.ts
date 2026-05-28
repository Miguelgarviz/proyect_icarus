import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Game } from '@backend/generated/prisma/client';

@Injectable()
export class GameService {
    constructor(private prisma: PrismaService) {}

    async getGame(gameWhereUniqueInput: Prisma.GameWhereUniqueInput): Promise<Game|null>{
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

    async getStoreByGame(storeId: number){
        return this.prisma.store.findUnique({
            where:{
                id:storeId
            }
        })
    }

    async nextPlayer(gameId: number, currentPlayerId: number){
        return this.prisma.game.update({
            where: {id: gameId},
            data: {
                actualPlayerId: currentPlayerId
            }
        })
    }
    
}

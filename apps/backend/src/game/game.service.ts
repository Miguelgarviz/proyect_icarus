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
}

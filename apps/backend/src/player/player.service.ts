import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';
import { Player, Prisma } from '../generated/prisma/client';

@Injectable()
export class PlayerService {
    constructor(private prisma: PrismaService) {}
    
    async getPlayer( playerWhereUniqueInput: Prisma.PlayerWhereUniqueInput ):Promise<Player | null> {
        return this.prisma.player.findUnique({
            where: playerWhereUniqueInput
        });
    }

    async getPlayers(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.PlayerWhereUniqueInput;
        where?: Prisma.PlayerWhereInput;
        orderBy?: Prisma.PlayerOrderByWithRelationInput;
    }):Promise<Player[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.player.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy
        });
    }

    async createPlayer(data: Prisma.PlayerCreateInput):Promise<Player> {
        return this.prisma.player.create({
            data
        });
    }

}

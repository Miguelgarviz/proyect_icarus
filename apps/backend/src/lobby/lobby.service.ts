import { Prisma, Lobby, Player } from '@backend/generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LobbyService {
    constructor(private prisma: PrismaService) {}

    async getLobby(lobbyWhereUniqueInput: Prisma.LobbyWhereUniqueInput){
        return this.prisma.lobby.findUnique({
            where: lobbyWhereUniqueInput
        });
    }

    async createLobby(data: Prisma.LobbyCreateInput): Promise<Lobby>{
        return this.prisma.lobby.create({
            data
        });
    }

    async getPlayersInLobby(lobbyWhereUniqueInput: Prisma.LobbyWhereUniqueInput): Promise<Player[]>{
        return this.prisma.player.findMany({
            where: { lobbyId: lobbyWhereUniqueInput.id }
        })
    }
    async updateLobby(params: {
        where: Prisma.LobbyWhereUniqueInput;
        data: Prisma.LobbyUpdateInput;
    }): Promise<Lobby> {
        const { where, data } = params;
        return this.prisma.lobby.update({
            data,
            where
        }); 
    }

    async addPlayerToLobby(params: {
        where: Prisma.LobbyWhereUniqueInput;
        data: { playerId: number };
    }): Promise<Lobby> {
        const { where, data } = params;

        return this.prisma.lobby.update({
            where,
            data: {
                numPlayers: { increment: 1 },
                players: {
                    connect: { id: data.playerId }
                }
            }
        });
    }

}

import {
  Prisma,
  Lobby,
  Player,
  Dificulty,
} from '@backend/generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LobbyService {
  constructor(private prisma: PrismaService) {}

  async getLobby(lobbyWhereUniqueInput: Prisma.LobbyWhereUniqueInput) {
    return this.prisma.lobby.findUniqueOrThrow({
      where: lobbyWhereUniqueInput,
    });
  }

  async createLobby(data: Prisma.LobbyCreateInput): Promise<Lobby> {
    for (let attempts = 0; attempts < 10; attempts++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      const existing = await this.prisma.lobby.findUnique({
        where: { lobbyCode: code },
      });

      if (!existing) {
        return this.prisma.lobby.create({
          data: { ...data, lobbyCode: code },
        });
      }
    }

    throw new Error('No se pudo generar un código único para el lobby');
  }

  async getPlayersInLobby(
    lobbyWhereUniqueInput: Prisma.LobbyWhereUniqueInput,
  ): Promise<Player[]> {
    return this.prisma.player.findMany({
      where: {
        lobbyId: lobbyWhereUniqueInput.id,
      },
      orderBy: { turnOrder: 'asc' },
    });
  }

  async getRemainingPlayers(
    lobbyWhereUniqueInput: Prisma.LobbyWhereUniqueInput,
  ) {
    return this.prisma.player.findMany({
      where: {
        lobbyId: lobbyWhereUniqueInput.id,
        cleanedUp: false,
      },
      orderBy: { turnOrder: 'asc' },
    });
  }
  async updateLobby(params: {
    where: Prisma.LobbyWhereUniqueInput;
    data: Prisma.LobbyUpdateInput;
  }): Promise<Lobby> {
    const { where, data } = params;
    return this.prisma.lobby.update({
      data,
      where,
    });
  }

  async changeLobbyDificulty(params: {
    where: Prisma.LobbyWhereUniqueInput;
    data: { dificulty: Dificulty };
  }): Promise<Lobby> {
    const { where, data } = params;
    return this.prisma.lobby.update({
      where,
      data: {
        dificulty: data.dificulty,
      },
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
          connect: { id: data.playerId },
        },
      },
    });
  }

  async removePlayerFromLobby(params: {
    where: Prisma.LobbyWhereUniqueInput;
    data: { playerId: number };
  }): Promise<Lobby> {
    const { where, data } = params;

    return this.prisma.lobby.update({
      where,
      data: {
        numPlayers: { decrement: 1 },
        players: {
          disconnect: { id: data.playerId },
        },
      },
    });
  }

  async getLobbieFromPlayer(playerId: number) {
    const player = await this.prisma.player.findUniqueOrThrow({
      where: { id: playerId },
      include: { lobby: true },
    });
    const lobby = await this.prisma.lobby.findUniqueOrThrow({
      where: { id: player.lobbyId! },
    });
    return lobby;
  }

  async getGoalFromLobby(lobbyId: number) {
    const lobby = await this.prisma.lobby.findFirstOrThrow({
      where: { id: lobbyId },
    });
    return lobby.dificulty;
  }

  async getLobbyByCode(lobbyCode: string){
    return await this.prisma.lobby.findUniqueOrThrow({
      where: { lobbyCode }
    })
  }

  async deleteLobby(lobbyId: number){
    return this.prisma.lobby.delete({
      where: { id: lobbyId }
    });
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { Lobby, Prisma, Player, Dificulty } from '../generated/prisma/client';
import { PlayerService } from '../player/player.service';
import { UserService } from '../user/user.service';

const PRESET_COLORS = ["#ef4444", "#3b82f6", "#eab308", "#22c55e"];

@Controller('lobby')
export class LobbyController {
  constructor(
    private readonly lobbyService: LobbyService,
    private readonly playerService: PlayerService,
    private readonly userService: UserService
  ) {}

  @Post()
  @HttpCode(201)
  async createLobby(
    @Body() lobbyData: Prisma.LobbyCreateInput,
  ): Promise<Lobby> {
    return this.lobbyService.createLobby(lobbyData);
  }

  @Get('/players/:id')
  async getPlayersInLobby(@Param('id') id: string): Promise<Player[]> {
    await this.lobbyService.getLobby({ id: Number(id) });
    return this.lobbyService.getPlayersInLobby({ id: Number(id) });
  }

  @Put('/join')
  async joinLobby(
    @Body() joinData: { code: string, userId: number }
  ): Promise<Lobby> {
    const lobby = await this.lobbyService.getLobbyByCode(joinData.code);
    if(lobby.numPlayers >= 4) {
      throw new NotFoundException(`El lobby con código ${joinData.code} está lleno`);
    }
    const user = await this.userService.getUser(Number(joinData.userId));
    const data = {
      name: user.username,
      color: PRESET_COLORS[lobby.numPlayers],
      movement: 3,
      turnOrder: lobby ? lobby.numPlayers : 0,
      lobby: { connect: { id: Number(lobby.id) } },
      user: { connect: { id: Number(joinData.userId) } },
    };
    const newPlayer = await this.playerService.createPlayer(data);
    return this.lobbyService.addPlayerToLobby({
      where: { id: Number(lobby.id) },
      data: { playerId: newPlayer.id },
    });
  }

  @Put('/:id/change-dificulty')
  async changeLobbyDificulty(
    @Param('id') id: string,
    @Body() dificultyData: { dificulty: Dificulty },
  ): Promise<Lobby> {
    return await this.lobbyService.changeLobbyDificulty(
      Number(id),
      dificultyData.dificulty);
  }
  @Get('/:id')
  async getLobby(@Param('id') id: string): Promise<Lobby> {
    return await this.lobbyService.getLobby({ id: Number(id) });
  }


  @Put('/:id')
  async updateLobby(
    @Param('id') id: string,
    @Body() lobbyData: Prisma.LobbyUpdateInput,
  ): Promise<Lobby> {
    return this.lobbyService.updateLobby({
      where: { id: Number(id) },
      data: lobbyData,
    });
  }

  @Put('/:id/remove-player')
  async removePlayerFromLobby(@Param('id') playerId: string, @Body("userId") userId: number): Promise<Lobby> {
    try {
      const lobby = await this.lobbyService.getLobbieFromPlayer(
        Number(playerId)
      );
      const player = await this.playerService.getPlayer({ id: Number(playerId) });
      if(lobby.hostId != Number(userId) && player.userId != Number(userId)) {
        throw new NotFoundException(
          `El jugador no puede ser eliminado`,
        );
      }
      await this.playerService.deletePlayer({ id: Number(playerId) });
      if (!lobby) {
        throw new NotFoundException(
          `No se encontró un lobby para el jugador ${Number(playerId)}`,
        );
      }
      return this.lobbyService.removePlayerFromLobby(lobby?.id ,Number(playerId));
    } catch (error: unknown) {
      throw new NotFoundException(
        `Error al eliminar el jugador ${Number(playerId)}: ${(error as Error).message}`,
      );
    }
  }

  @Delete('/:id')
  async deleteLobby(@Param('id') id: string, @Body("userId") userId: Number): Promise<Lobby> {
    const lobby = await this.lobbyService.getLobby({ id: Number(id) });
    if(lobby.hostId !== Number(userId)) {
      throw new NotFoundException(
        `El usuario no tiene permisos para eliminar el lobby ${Number(id)}`,
      );
    }
    return this.lobbyService.deleteLobby(Number(id));
  }

}

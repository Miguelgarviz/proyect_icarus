import { UserService } from "../user/user.service";
import { LobbyService } from "../lobby/lobby.service";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { PlayerService } from "../player/player.service";
import { NotFoundException } from "@nestjs/common";

interface LobbyDataDto{
    lobbyId?: string;
    lobbyCode: string;
    userId: number;
}

const PRESET_COLORS = ["#ef4444", "#3b82f6", "#eab308", "#22c55e"];

@WebSocketGateway({
    cors: {
        origin: 'http://localhost:3000',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    }
})
export class AppGateway{
    constructor(
        private readonly lobbyService: LobbyService,
        private readonly playerService: PlayerService,
        private readonly userService: UserService
    ){}
    @WebSocketServer()
    server!: Server;

    // ─────────────────────────────────────────────────────────────────────────────
    // Lobby and Home Websockets
    // ─────────────────────────────────────────────────────────────────────────────

    @SubscribeMessage('createLobby')
    async handleCreateLobby(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { userId: string }
    ){
        try{
            const lobby = await this.lobbyService.createLobby({
                host: { connect: { id: Number(data.userId) } },
                lobbyCode: ""
            });

            const room = `lobby-${lobby.lobbyCode}`;
            client.join(room);

            // console.log("Lobby created with code:", lobby.lobbyCode);

            const user = await this.userService.getUser(Number(data.userId));
            const playerData = {
                name: user.username,
                color: PRESET_COLORS[lobby.numPlayers],
                movement: 3,
                turnOrder: lobby ? lobby.numPlayers : 0,
                lobby: { connect: { id: Number(lobby.id) } },
                user: { connect: { id: Number(user.id) } },
            };
            const newPlayer = await this.playerService.createPlayer(playerData);
            await this.lobbyService.addPlayerToLobby({
                where: { id: Number(lobby.id) },
                data: { playerId: newPlayer.id },
            });
            
            this.server.to(room).emit('lobbyCreated',{
                success: true,
                lobbyId: lobby.id,
                error: ""
            })
            return {success: true, lobbyId: lobby.id, error: ""}
        }catch(error){
            console.error("Error creating lobby:", error);
            client.emit('errorCreatingLobby', { message: 'Error creating lobby' });
            return { success: false, error: 'Error creating lobby' }
        }
    }

    @SubscribeMessage('joinLobbyRoom')
handleJoinLobbyRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { lobbyCode: string, userId: number }
) {
    client.data.userId = data.userId;
    const room = `lobby-${data.lobbyCode}`;
    client.join(room);
    return { success: true };
}

    @SubscribeMessage('joinLobby')
    async handleJoinLobby(
        @ConnectedSocket() client: Socket, 
        @MessageBody() data: LobbyDataDto){
        try{
            

            const lobby = await this.lobbyService.getLobbyByCode(data.lobbyCode);
            const user = await this.userService.getUser(Number(data.userId));
            const playerData = {
                name: user.username,
                color: PRESET_COLORS[lobby.numPlayers],
                movement: 3,
                turnOrder: lobby ? lobby.numPlayers : 0,
                lobby: { connect: { id: Number(lobby.id) } },
                user: { connect: { id: Number(user.id) } },
            };
            const newPlayer = await this.playerService.createPlayer(playerData);
            await this.lobbyService.addPlayerToLobby({
                where: { id: Number(lobby.id) },
                data: { playerId: newPlayer.id },
            });
            const room = `lobby-${data.lobbyCode}`;
            client.join(room);
            this.server.to(room).emit('playerJoined',{
                success: true,
                lobbyId: lobby.id,
                error: ""
            })
            return {success: true, lobbyId: lobby.id, error: ""}
            }catch(error){
                console.error("Error joining lobby:", error);
                client.emit('errorJoiningLobby', { message: 'Error joining lobby' });
                return { success: false, error: 'CÓDIGO NO ENCONTRADO' }
            }
    }

    @SubscribeMessage('removePlayer')
    async handleRemovePlayer(
        @ConnectedSocket() client:Socket,
        @MessageBody() data: {playerId: number, userId: number}
    ){
        try {
              const lobby = await this.lobbyService.getLobbieFromPlayer(
                Number(data.playerId)
              );
              const room = `lobby-${lobby.lobbyCode}`;
              client.join(room);

              const player = await this.playerService.getPlayer({ id: Number(data.playerId) });
              if((lobby.hostId != Number(data.userId) && player.userId != Number(data.userId)) || (player.userId == lobby.hostId)) {
                throw new NotFoundException(
                  `El jugador no puede ser eliminado`,
                );
              }
              await this.playerService.deletePlayer({ id: Number(data.playerId) });
              if (!lobby) {
                throw new NotFoundException(
                  `No se encontró un lobby para el jugador ${Number(data.playerId)}`,
                );
              }
              await this.lobbyService.removePlayerFromLobby({
                where: { id: lobby?.id },
                data: { playerId: Number(data.playerId) },
              });

              const sockets = await this.server.in(room).fetchSockets();
              const targetSocket = sockets.find(s => s.data.userId === player.userId);
                if (targetSocket) {
                    // Le avisamos antes de echarlo
                    targetSocket.emit('removedFromLobby', { reason: 'HOST_REMOVED' });
                    // Lo sacamos de la sala
                    targetSocket.leave(room);
                }
                this.server.to(room).emit('playerLeft', { userId: player.userId });
              return {success: true, error: ""}
            } catch (error: unknown) {
                console.error("Error removing player:", error);
                client.emit('errorRemovingPlayer', { message: 'Error removing player' });
                return { success: false, error: 'NO SE PUDO ELIMINAR AL JUGADOR' }
            }
    }

    @SubscribeMessage('deleteLobby')
    async handleDeleteLobby(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: {lobbyId: number, userId: number}
    ){
        try{
            const lobby = await this.lobbyService.getLobby({ id: Number(data.lobbyId) });
            
            const room = `lobby-${lobby.lobbyCode}`;
            client.join(room);

            if(lobby.hostId !== Number(data.userId)) {
                throw new NotFoundException(
                `El usuario no tiene permisos para eliminar el lobby ${Number(data.lobbyId)}`,
                );
            }

            this.server.to(room).emit('lobbyDeleted', { reason: 'HOST_DELETED' });

            const sockets = await this.server.in(room).fetchSockets();
            for (const socket of sockets) {
                socket.leave(room);
            }
            
            await this.lobbyService.deleteLobby(Number(data.lobbyId));

            return { success: true };
        }catch(error){
            console.error("Error deleting lobby:", error);
            client.emit('errorDeletingLobby', { message: 'Error deleting lobby' });
            return { success: false, error: 'NO SE PUDO ELIMINAR EL LOBBY' }
        }
    }

    @SubscribeMessage('updateData')
    async handleUpdateData(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: {lobbyCode: string}
    ){
        const room = `lobby-${data.lobbyCode}`;

        client.to(room).emit('updatedData')
        
        return { success: true }
    }

    @SubscribeMessage('startGame')
    async handleStartGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: {lobbyCode: string, gameId: string}
    ){
        const room = `lobby-${data.lobbyCode}`;

        const gameRoom = `game-${data.gameId}`;
        client.join(gameRoom);

        client.to(room).emit('gameStarted', { gameId: data.gameId })
        
        return { success: true , gameId: data.gameId}
    }


  // ─────────────────────────────────────────────────────────────────────────────
  // Game Websockets
  // ─────────────────────────────────────────────────────────────────────────────

  @SubscribeMessage('joinGameRoom')
    handleJoinGameRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: number, userId: number }
) {
    client.data.userId = data.userId;
    const room = `game-${data.gameId}`;
    client.join(room);
    return { success: true };
}

  @SubscribeMessage('passingTurn')
  async handlePassingTurn(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {gameId: number, type: string}
  ){
    const room = `game-${data.gameId}`

    if(data.type === "death"){
        client.to(room).emit('explosionGameOver')
    }else{
        client.to(room).emit('updateData')
    }
  }

  @SubscribeMessage('movingPlayer')
  async handleMovingPlayer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {gameId: number}
  ){
    const room = `game-${data.gameId}`

    client.to(room).emit('updateData')
  }

  @SubscribeMessage('buyCard')
  async handleBuyingCards(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {gameId: number}
  ){
    const room = `game-${data.gameId}`

    client.to(room).emit('buyedCard')
  }

  @SubscribeMessage('playCard')
  async handlePlayCardEffect(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {gameId: number}
  ){
    const room = `game-${data.gameId}`

    client.to(room).emit('playedCard')
  }

  @SubscribeMessage('resetGame')
  async handleResetGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {gameId: number}
  ){
    const room = `game-${data.gameId}`

    client.to(room).emit('endGame')

    const sockets = await this.server.in(room).fetchSockets();
    for (const socket of sockets) {
        socket.leave(room);
    }
  }

  @SubscribeMessage('victoryScreen')
  async handleVictoryScreen(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {gameId: number}
  ){
    const room = `game-${data.gameId}`

    client.to(room).emit('victoryScreenShow')
  }

}
import { UserService } from "../user/user.service";
import { LobbyService } from "../lobby/lobby.service";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { PlayerService } from "../player/player.service";
import { NotFoundException } from "@nestjs/common";

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
        @MessageBody() data: { lobbyCode: string }){
            const room = `lobby-${data.lobbyCode}`;
            client.join(room);
            this.server.to(room).emit('playerJoined')
    }

    @SubscribeMessage('removePlayer')
    async handleRemovePlayer(
        @ConnectedSocket() client:Socket,
        @MessageBody() data: { userId: number, lobbyCode: string }
    ){
        const room = `lobby-${data.lobbyCode}`;
        client.join(room);

              
        const sockets = await this.server.in(room).fetchSockets();
        const targetSocket = sockets.find(s => s.data.userId === data.userId);
        if (targetSocket) {
            targetSocket.emit('removedFromLobby');
            targetSocket.leave(room);
        }
        this.server.to(room).emit('playerLeft');
    }

    @SubscribeMessage('deleteLobby')
    async handleDeleteLobby(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: {lobbyCode: string, userId: number}
    ){
            
            const room = `lobby-${data.lobbyCode}`;
            client.join(room);

            this.server.to(room).emit('lobbyDeleted');

            const sockets = await this.server.in(room).fetchSockets();
            for (const socket of sockets) {
                socket.leave(room);
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
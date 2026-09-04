import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'

interface DataDto {
    lobbyId: number;
}

@WebSocketGateway()
export class LobbyGateway {

    @WebSocketServer()
    server!: Server;
    
    @SubscribeMessage('joinLobby')
    handleJoinLobby(
        @ConnectedSocket() client: Socket, 
        @MessageBody() data: DataDto){

        console.log("DATA", data)
        const room = `lobby-${data.lobbyId}`;
        client.join(room);

        console.log(
            `Socket ${client.id} se ha unido a ${room}`,
        );

        this.server.to(room).emit('joinedLobby', {
            message: `Socket ${client.id} se ha unido a ${room}`,
            lobbyId: data.lobbyId,
        });
    }
}
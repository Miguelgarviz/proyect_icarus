import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

import { Socket } from 'socket.io';

@WebSocketGateway()
export class GameGateway {

  @SubscribeMessage('ping')
  handlePing(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('PING recibido:', data);

    return {
      event: 'pong',
      data: {
        message: 'pong',
        received: data,
      },
    };
  }
}
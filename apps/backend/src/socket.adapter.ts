// socket.adapter.ts
import 'dotenv/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

const FRONTEND_URL = process.env.FRONTEND_URL

export class CorsIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions) {
    return super.createIOServer(port, {
      ...options,
      cors: {
        origin: FRONTEND_URL,
        credentials: true,
      },
    });
  }
}
import 'dotenv/config';
import { io } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const socket = io(BACKEND_URL, {
  autoConnect: false,
});

socket.on('connect', () => {
  console.log('🟢 WebSocket conectado:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('🔴 WebSocket connect_error:', error);
  console.error('message:', error.message);
});

socket.on('disconnect', (reason) => {
  console.warn('🟡 WebSocket desconectado:', reason);
});

socket.io.on('error', (error) => {
  console.error('🔴 Socket.IO Manager error:', error);
});

socket.io.on('reconnect_attempt', (attempt) => {
  console.log('🔄 Intentando reconectar:', attempt);
});

socket.io.on('reconnect_error', (error) => {
  console.error('🔴 Error de reconexión:', error);
});
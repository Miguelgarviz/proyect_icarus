import 'dotenv/config';
import { io } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.slice(0,22)

export const socket = io(BACKEND_URL, {
    autoConnect: false, // no conecta hasta que lo digas explícitamente
});
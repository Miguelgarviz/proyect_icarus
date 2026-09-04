import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

interface DataDto {
  lobbyId?: number
  message?: string
}

socket.on('connect', () => {
  console.log('Conectado:', socket.id);

  socket.emit('joinLobby', {
    lobbyId: 15
  });
});

socket.on('pong', (data: DataDto) => {
  console.log('PONG recibido:', data);

  socket.disconnect();
});

socket.on('joinedLobby', (data) => {
  console.log('Unido al lobby:', data);

  socket.disconnect();
});


socket.on('connect_error', (error) => {
  console.error('Error de conexión:', error);
});
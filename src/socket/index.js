import { socketAuthenticate } from './authenticate.js';
import { handleJoinRoom, handleLeaveRoom } from './handlers/roomHandler.js';
import { handleSendMessage, handleDisconnect } from './handlers/messageHandler.js';

export const initializeSocket = (io) => {
  const chatNamespace = io.of('/chat');

  chatNamespace.use(socketAuthenticate);

  chatNamespace.on('connection', (socket) => {
    console.log('Пользователь подключился к сокету');

    socket.on('room:join', handleJoinRoom(socket, chatNamespace));
    socket.on('room:leave', handleLeaveRoom(socket, chatNamespace));
    socket.on('message:send', handleSendMessage(socket, chatNamespace));
    socket.on('disconnect', handleDisconnect(socket));

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  });
};

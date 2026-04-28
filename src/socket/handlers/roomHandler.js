import * as roomService from '../../services/roomService.js';
import prisma from '../../prismaClient.js';
import { getUserBySupabaseId } from '../../utils/socketUtils.js';

export const handleJoinRoom = (socket, chatNamespace) => {
  return async (roomId) => {
    try {
      const user = await getUserBySupabaseId(socket.data.user.sub);

      await roomService.joinRoom(roomId, user.supabaseId);

      socket.join(roomId);

      const members = await prisma.roomMember.findMany({
        where: { roomId },
        include: {
          user: {
            select: { id: true, name: true, email: true, supabaseId: true },
          },
        },
      });

      const membersList = members.map(m => ({
        id: m.user.id,
        name: m.user.name || m.user.email,
        email: m.user.email,
      }));

      socket.emit('room:users', membersList);

      socket.to(roomId).emit('user:online', {
        userId: user.id,
        username: user.name || user.email,
      });

      socket.emit('room:joined', { roomId });
    } catch (error) {
      console.error('Join room error:', error);
      socket.emit('error', { message: error.message || 'Ошибка входа в комнату' });
    }
  };
};

export const handleLeaveRoom = (socket, chatNamespace) => {
  return async (roomId) => {
    try {
      const user = await getUserBySupabaseId(socket.data.user.sub);

      const isMember = await prisma.roomMember.findUnique({
        where: { userId_roomId: { userId: user.id, roomId } },
      });

      if (!isMember) {
        socket.emit('error', { message: 'Вы не состоите в этой комнате' });
        return;
      }

      await roomService.leaveRoom(roomId, user.supabaseId);

      socket.leave(roomId);

      socket.to(roomId).emit('user:offline', {
        userId: user.id,
        username: user.name || user.email,
      });

      socket.emit('room:left', { roomId });
    } catch (error) {
      console.error('Leave room error:', error);
      socket.emit('error', { message: error.message || 'Ошибка выхода из комнаты' });
    }
  };
};

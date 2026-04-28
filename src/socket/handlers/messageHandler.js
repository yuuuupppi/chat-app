import * as messageService from '../../services/messageService.js';
import prisma from '../../prismaClient.js';
import { getUserBySupabaseId } from '../../utils/socketUtils.js';

export const handleSendMessage = (socket, chatNamespace) => {
  return async (data) => {
    const { roomId, content } = data;

    if (!content || content.trim() === '') {
      socket.emit('error', { message: 'Сообщение не может быть пустым' });
      return;
    }

    try {
      const user = await getUserBySupabaseId(socket.data.user.sub);

      const isMember = await prisma.roomMember.findUnique({
        where: { userId_roomId: { userId: user.id, roomId } },
      });

      if (!isMember) {
        socket.emit('error', { message: 'Вы не состоите в этой комнате' });
        return;
      }

      const message = await messageService.createMessage(roomId, user.supabaseId, content);

      chatNamespace.to(roomId).emit('message:receive', {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderName: message.sender?.name || message.sender?.email || 'Пользователь',
        roomId: message.roomId,
        createdAt: message.createdAt,
      });
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: error.message || 'Ошибка отправки сообщения' });
    }
  };
};

export const handleDisconnect = (socket) => {
  return async () => {
    if (!socket.data.user) return;

    try {
      const user = await getUserBySupabaseId(socket.data.user.sub);

      const rooms = await prisma.roomMember.findMany({
        where: { userId: user.id },
        select: { roomId: true },
      });

      for (const { roomId } of rooms) {
        socket.to(roomId).emit('user:offline', {
          userId: user.id,
          username: user.name || user.email,
        });
      }
    } catch (error) {
      // Игнорируем ошибки при отключении
    }
  };
};

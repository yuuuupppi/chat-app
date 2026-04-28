import prisma from '../prismaClient.js';

export const socketAuthenticate = async (socket, next) => {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return next(new Error('Пользователь не найден'));
    }
    socket.data.user = { sub: user.supabaseId };
    next();
  } catch (error) {
    next(new Error('Ошибка аутентификации'));
  }
};

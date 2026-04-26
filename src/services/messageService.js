import prisma from "../prismaClient.js";
import AppError from "../utils/appError.js";

const getUserBySupabaseId = async (supabaseId) => {
  const user = await prisma.user.findUnique({ where: { supabaseId } });
  if (!user) throw new AppError("Пользователь не найден", 404);
  return user;
};

export const getMessages = async (roomId) => {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new AppError("Комната не найдена", 404);

  return prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const createMessage = async (roomId, supabaseId, content) => {
  const user = await getUserBySupabaseId(supabaseId);

  const isMember = await prisma.roomMember.findUnique({
    where: { userId_roomId: { userId: user.id, roomId } },
  });
  if (!isMember)
    throw new AppError("Вы не являетесь участником этой комнаты", 403);

  return prisma.message.create({
    data: {
      roomId,
      senderId: user.id,
      content,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

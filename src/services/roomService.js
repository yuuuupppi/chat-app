import prisma from "../prismaClient.js";
import AppError from "../utils/appError.js";

const getUserBySupabaseId = async (supabaseId) => {
  const user = await prisma.user.findUnique({ where: { supabaseId } });
  if (!user) throw new AppError("Пользователь не найден", 404);
  return user;
};

export const getRooms = async () => {
  return prisma.room.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const getRoomById = async (id) => {
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) throw new AppError("Комната не найдена", 404);
  return room;
};

export const createRoom = async (name, supabaseId) => {
  const user = await getUserBySupabaseId(supabaseId);

  const existing = await prisma.room.findUnique({ where: { name } });
  if (existing)
    throw new AppError("Комната с таким названием уже существует", 400);

  const room = await prisma.room.create({ data: { name } });
  await prisma.roomMember.create({
    data: { roomId: room.id, userId: user.id },
  });

  return room;
};

export const deleteRoom = async (id) => {
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) throw new AppError("Комната не найдена", 404);

  await prisma.room.delete({ where: { id } });
};

export const joinRoom = async (roomId, supabaseId) => {
  const user = await getUserBySupabaseId(supabaseId);
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new AppError("Комната не найдена", 404);

  const existing = await prisma.roomMember.findUnique({
    where: { userId_roomId: { userId: user.id, roomId } },
  });
  if (existing) throw new AppError("Вы уже в этой комнате", 400);

  return prisma.roomMember.create({ data: { roomId, userId: user.id } });
};

export const leaveRoom = async (roomId, supabaseId) => {
  const user = await getUserBySupabaseId(supabaseId);

  const member = await prisma.roomMember.findUnique({
    where: { userId_roomId: { userId: user.id, roomId } },
  });
  if (!member) throw new AppError("Вы не в этой комнате", 400);

  await prisma.roomMember.delete({
    where: { userId_roomId: { userId: user.id, roomId } },
  });
};

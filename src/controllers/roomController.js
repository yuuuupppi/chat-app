import * as roomService from "../services/roomService.js";

export const getRooms = async (req, res, next) => {
  try {
    const rooms = await roomService.getRooms();
    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (req, res, next) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req, res, next) => {
  try {
    const { name } = req.body;
    const supabaseId = req.user.sub;
    const room = await roomService.createRoom(name, supabaseId);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    await roomService.deleteRoom(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const joinRoom = async (req, res, next) => {
  try {
    const supabaseId = req.user.sub;
    await roomService.joinRoom(req.params.id, supabaseId);
    res.status(200).json({ success: true, message: "Вы вступили в комнату" });
  } catch (error) {
    next(error);
  }
};

export const leaveRoom = async (req, res, next) => {
  try {
    const supabaseId = req.user.sub;
    await roomService.leaveRoom(req.params.id, supabaseId);
    res.status(200).json({ success: true, message: "Вы покинули комнату" });
  } catch (error) {
    next(error);
  }
};

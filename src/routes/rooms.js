import { Router } from "express";
import * as roomController from "../controllers/roomController.js";
import authenticate from "../middleware/authenticate.js";
import { validate } from "../validators/auth.js";
import { createRoomSchema } from "../validators/room.js";

const router = Router();

router.get("/", roomController.getRooms);
router.get("/:id", roomController.getRoomById);
router.post(
  "/",
  authenticate,
  validate(createRoomSchema),
  roomController.createRoom
);
router.delete("/:id", authenticate, roomController.deleteRoom);
router.post("/:id/join", authenticate, roomController.joinRoom);
router.delete("/:id/leave", authenticate, roomController.leaveRoom);

export default router;

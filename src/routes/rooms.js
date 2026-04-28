import { Router } from "express";
import * as roomController from "../controllers/roomController.js";
import authenticate from "../middleware/authenticate.js";
import { validate } from "../validators/auth.js";
import { createRoomSchema } from "../validators/room.js";

const router = Router();

router.get("/", roomController.getRooms);
router.get("/my", authenticate, roomController.getMyRooms);
router.get("/:id", roomController.getRoomById);
router.post("/", authenticate, validate(createRoomSchema), roomController.createRoom);
router.delete("/:id", authenticate, roomController.deleteRoom);

export default router;

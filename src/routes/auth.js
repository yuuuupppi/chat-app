import { Router } from "express";
import * as authController from "../controllers/authController.js";
import authenticate from "../middleware/authenticate.js";
import { validate, registerSchema, loginSchema } from "../validators/auth.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authenticate, authController.logout);

export default router;

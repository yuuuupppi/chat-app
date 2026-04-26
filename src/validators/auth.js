import { z } from "zod";
import AppError from "../utils/appError.js";

export const registerSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Пароль должен содержать минимум 8 символов"),
  name: z.string().min(1).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Пароль должен содержать минимум 8 символов"),
});

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errorMessage = result.error.errors[0].message;
    return next(new AppError(errorMessage, 400));
  }

  req.body = result.data;
  next();
};

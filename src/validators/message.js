import { z } from "zod";

export const createMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Сообщение не может быть пустым")
    .max(2000, "Сообщение слишком длинное"),
});

import setupSwagger from "./swagger.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import config from "./config.js";
import authRoutes from "./routes/auth.js";
import roomsRoutes from "./routes/rooms.js";
import messagesRoutes from "./routes/messages.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Слишком много запросов с этого IP, попробуйте позже.",
});
app.use("/api", limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api", messagesRoutes);

// Swagger документация
setupSwagger(app);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Маршрут не найден" });
});

// Error handler
app.use(errorHandler);

export default app;

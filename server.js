import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initializeSocket } from './src/socket/index.js';
import app from './src/app.js';
import config from './src/config.js';

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: config.frontendUrl || 'http://localhost:5173',
    credentials: true,
  },
});

app.set('io', io);
initializeSocket(io);

httpServer.listen(config.port, () => {
  console.log(`🚀 Сервер запущен на порту ${config.port}`);
  console.log(`📝 Режим: ${config.nodeEnv}`);
  console.log(`🔗 http://localhost:${config.port}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM сигнал получен, закрываю сервер...');
  httpServer.close(() => {
    console.log('Сервер закрыт');
    process.exit(0);
  });
});

import { PrismaClient } from '../generated/prisma/index.js';
import 'dotenv/config';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Настройки пула соединений через сам Prisma Client не настраиваются напрямую
// Они задаются через connection string в DATABASE_URL
// Добавляем параметры в URL строку: ?pool_timeout=30&connection_limit=5

export default prisma;

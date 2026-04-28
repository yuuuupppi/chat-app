import prisma from '../prismaClient.js';
import AppError from '../utils/appError.js';

const authenticate = async (req, res, next) => {
  try {
    // Находим любого пользователя в базе (для тестов)
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return next(new AppError('Пользователь не найден', 404));
    }
    
    // Подставляем реальный supabaseId из базы
    req.user = { sub: user.supabaseId };
    next();
  } catch (error) {
    next(new AppError('Ошибка аутентификации', 401));
  }
};

export default authenticate;

import { createRemoteJWKSet, jwtVerify } from "jose";
import config from "../config.js";
import AppError from "../utils/appError.js";

const JWKS = createRemoteJWKSet(
  new URL(`${config.supabase.url}/.well-known/jwks.json`)
);
const ISSUER = config.supabase.url;

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Не авторизован. Токен не предоставлен", 401));
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: ISSUER,
      audience: "authenticated",
    });

    req.user = payload;
    next();
  } catch (error) {
    console.error("Ошибка аутентификации:", error.message);
    return next(new AppError("Недействительный или истёкший токен", 401));
  }
};

export default authenticate;

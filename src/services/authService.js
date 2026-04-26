import supabase from "../supabase.js";
import prisma from "../prismaClient.js";
import AppError from "../utils/appError.js";

export const register = async (email, password, name) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new AppError(error.message, 400);
  }

  const user = await prisma.user.create({
    data: {
      supabaseId: data.user.id,
      email: data.user.email,
      name: name || null,
    },
  });

  return { user, session: data.session };
};

export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new AppError("Неверный email или пароль", 401);
  }

  return data.session;
};

export const logout = async (accessToken) => {
  const { error } = await supabase.auth.signOut(accessToken);

  if (error) {
    throw new AppError(error.message, 400);
  }
};

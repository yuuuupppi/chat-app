import * as authService from "../services/authService.js";

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const { user, session } = await authService.register(email, password, name);

    res.status(201).json({
      success: true,
      data: { user, session },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const session = await authService.login(email, password);

    res.status(200).json({
      success: true,
      data: { session },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    await authService.logout(token);

    res.status(200).json({
      success: true,
      message: "Успешный выход из системы",
    });
  } catch (error) {
    next(error);
  }
};

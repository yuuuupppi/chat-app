import * as messageService from "../services/messageService.js";

export const getMessages = async (req, res, next) => {
  try {
    const messages = await messageService.getMessages(req.params.id);
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

export const createMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const supabaseId = req.user.sub;
    const message = await messageService.createMessage(
      req.params.id,
      supabaseId,
      content
    );
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

import * as messageService from '../services/messageService.js';

export const getMessages = async (req, res, next) => {
  try {
    const messages = await messageService.getMessages(req.params.id);
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

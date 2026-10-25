import * as whatsappService from '../services/whatsappService.js';
import { success } from '../utils/response.js';

export const createWhatsappOrderLink = async (req, res, next) => {
  try {
    const data = await whatsappService.generateWhatsappOrderLink(req.body);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

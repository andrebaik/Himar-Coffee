import * as eventService from '../services/eventService.js';
import { success } from '../utils/response.js';

export const getEvents = async (req, res, next) => {
  try {
    const data = await eventService.getEvents(req.query);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const data = await eventService.getEventById(req.params.id);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

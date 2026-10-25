import * as menuService from '../services/menuService.js';
import { success } from '../utils/response.js';

export const getMenus = async (req, res, next) => {
  try {
    const data = await menuService.getMenus(req.query);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const data = await menuService.getCategories();
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

export const getMenuById = async (req, res, next) => {
  try {
    const data = await menuService.getMenuById(req.params.id);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

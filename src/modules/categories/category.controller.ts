import type { Request, Response } from 'express';
import { categoryService } from './category.service.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { SUCCESS_MESSAGES } from '../../constants/messages.constants.js';
import type { CategoryIdInput, CreateCategoryInput, UpdateCategoryInput } from './category.validation.js';

export class CategoryController {
  getAllCategories = async (_req: Request, res: Response): Promise<void> => {
    const categories = await categoryService.getAllCategories();
    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, categories);
  };

  getCategoryTree = async (_req: Request, res: Response): Promise<void> => {
    const tree = await categoryService.getCategoryTree();
    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, tree);
  };

  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    const { categoryId } = req.validated?.params as CategoryIdInput;
    const category = await categoryService.getCategoryById(categoryId);
    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, category);
  };

  createCategory = async (req: Request, res: Response): Promise<void> => {
    const input = req.validated?.body as CreateCategoryInput;
    const category = await categoryService.createCategory(input);
    sendSuccess(res, 201, SUCCESS_MESSAGES.SUCCESS, category);
  };

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    const { categoryId } = req.validated?.params as CategoryIdInput;
    const input = req.validated?.body as UpdateCategoryInput;
    const category = await categoryService.updateCategory(categoryId, input);
    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, category);
  };

  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    const { categoryId } = req.validated?.params as CategoryIdInput;
    await categoryService.deleteCategory(categoryId);
    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS);
  };
}

export const categoryController = new CategoryController();

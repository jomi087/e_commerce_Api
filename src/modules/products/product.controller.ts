import type { Request, Response } from 'express';
import { productService } from './product.service.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { SUCCESS_MESSAGES } from '../../constants/messages.constants.js';
import type {
  CreateProductInput,
  ProductIdInput,
  ProductQueryInput,
  UpdateProductInput,
  UpdateProductStatusInput,
} from './product.validation.js';

export class ProductController {
  getAllProducts = async (req: Request, res: Response): Promise<void> => {
    const query = req.validated?.query as ProductQueryInput;

    const result = await productService.getAllProducts(query, false);

    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, result);
  };

  getAllProductsAdmin = async (req: Request, res: Response): Promise<void> => {
    const query = req.validated?.query as ProductQueryInput;

    const result = await productService.getAllProducts(query, true);

    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, result);
  };

  getProductById = async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.validated?.params as ProductIdInput;

    const product = await productService.getProductById(productId, false);

    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, product);
  };

  createProduct = async (req: Request, res: Response): Promise<void> => {
    const input = req.validated?.body as CreateProductInput;

    const product = await productService.createProduct(input);

    sendSuccess(res, 201, SUCCESS_MESSAGES.SUCCESS, product);
  };

  updateProduct = async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.validated?.params as ProductIdInput;
    const input = req.validated?.body as UpdateProductInput;

    const product = await productService.updateProduct(productId, input);

    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, product);
  };

  deleteProduct = async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.validated?.params as ProductIdInput;

    await productService.deleteProduct(productId);

    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS);
  };

  updateProductStatus = async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.validated?.params as ProductIdInput;
    const { status } = req.validated?.body as UpdateProductStatusInput;

    const product = await productService.updateProductStatus(productId, status);

    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, product);
  };
}

export const productController = new ProductController();

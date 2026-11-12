import { Types } from 'mongoose';
import { Product } from './product.model.js';
import { ApiError } from '../../utils/ApiError.js';
import type {
  CreateProductInput,
  ProductQueryInput,
  UpdateProductInput,
} from './product.validation.js';
import { Category } from '../categories/category.model.js';

export class ProductService {
  private async checkCategoryExists(categoryId: string): Promise<void> {
    const exists = await Category.exists({ _id: categoryId });

    if (!exists) {
      throw ApiError.badRequest('Invalid category: category does not exist');
    }
  }

  private async checkSkuExists(sku: string, excludeId?: string): Promise<void> {
    const filter: Record<string, unknown> = {
      sku: sku.trim().toUpperCase(),
    };

    if (excludeId) {
      filter._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const exists = await Product.exists(filter);

    if (exists) {
      throw ApiError.conflict('A product with this SKU already exists');
    }
  }

  private async getCategoryAndDescendantIds(
    categoryId: string
  ): Promise<Types.ObjectId[]> {
    await this.checkCategoryExists(categoryId);

    const result: Types.ObjectId[] = [new Types.ObjectId(categoryId)];
    const visited = new Set<string>([categoryId]);
    let currentLevel = [new Types.ObjectId(categoryId)];

    // Walk every level until no more descendants are found.
    while (currentLevel.length > 0) {
      const children = await Category.find({
        parent: { $in: currentLevel },
      })
        .select('_id')
        .lean();

      const nextLevel: Types.ObjectId[] = [];

      for (const child of children) {
        const childId = child._id.toString();

        if (!visited.has(childId)) {
          visited.add(childId);
          const objectId = new Types.ObjectId(childId);

          result.push(objectId);
          nextLevel.push(objectId);
        }
      }

      currentLevel = nextLevel;
    }

    return result;
  }

  async getAllProducts(query: ProductQueryInput, isAdmin: boolean) {
    const { search, category, minPrice, maxPrice, sortBy, order, page, limit } = query;

    const filter: Record<string, unknown> = {};

    // Customers see active products only. Admins see all products.
    if (!isAdmin) {
      filter.status = 'active';
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: escapedSearch, $options: 'i' };
    }

    if (category) {
      filter.category = {
        $in: await this.getCategoryAndDescendantIds(category),
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};

      if (minPrice !== undefined) priceFilter.$gte = minPrice;
      if (maxPrice !== undefined) priceFilter.$lte = maxPrice;

      filter.price = priceFilter;
    }

    const skip = (page - 1) * limit;
    const sortDirection = order === 'asc' ? 1 : -1;

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return {
      products,
      pagination: {
        totalProducts,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        limit,
      },
    };
  }

  async getProductById(productId: string, isAdmin: boolean) {
    const filter: Record<string, unknown> = {
      _id: productId,
    };

    if (!isAdmin) {
      filter.status = 'active';
    }

    const product = await Product.findOne(filter).lean();

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return product;
  }

  async createProduct(input: CreateProductInput) {
    await this.checkCategoryExists(input.category);
    await this.checkSkuExists(input.sku);

    try {
      const product = await Product.create({
        ...input,
        sku: input.sku.trim().toUpperCase(),
      });

      return product.toObject();
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw ApiError.conflict('A product with this SKU already exists');
      }

      throw error;
    }
  }

  async updateProduct(productId: string, input: UpdateProductInput) {
    const product = await Product.findById(productId);

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    if (input.category !== undefined) {
      await this.checkCategoryExists(input.category);
    }

    if (input.sku !== undefined) {
      await this.checkSkuExists(input.sku, productId);
      product.sku = input.sku.trim().toUpperCase();
    }

    const newPrice = input.price ?? product.price;
    const newSalePrice =
      input.salePrice !== undefined ? input.salePrice : product.salePrice;

    if (newSalePrice !== null && newSalePrice > newPrice) {
      throw ApiError.badRequest('Sale price cannot exceed original price');
    }

    if (input.name !== undefined) product.name = input.name;
    if (input.description !== undefined) {
      product.description = input.description;
    }
    if (input.price !== undefined) product.price = input.price;
    if (input.salePrice !== undefined) {
      product.salePrice = input.salePrice;
    }
    if (input.stock !== undefined) product.stock = input.stock;
    if (input.category !== undefined) {
      product.category = new Types.ObjectId(input.category);
    }

    try {
      await product.save();
      return product.toObject();
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw ApiError.conflict('A product with this SKU already exists');
      }

      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    const product = await Product.findById(productId);

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    await product.deleteOne();
  }

  async updateProductStatus(productId: string, status: 'active' | 'inactive') {
    const product = await Product.findByIdAndUpdate(
      productId,
      { status },
      { returnDocument: 'after', runValidators: true }
    );

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return product;
  }
}

export const productService = new ProductService();

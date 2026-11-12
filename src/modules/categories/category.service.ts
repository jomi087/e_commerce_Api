import { Types } from 'mongoose';
import { Category } from './category.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { ERROR_MESSAGES } from '../../constants/messages.constants.js';
import type { CreateCategoryInput, UpdateCategoryInput } from './category.validation.js';
import { Product } from '../products/product.model.js';

type CategoryTreeNode = {
  _id: string;
  name: string;
  description: string;
  parent: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  children: CategoryTreeNode[];
};

export class CategoryService {
  private async checkDuplicateName(
    name: string,
    parent: Types.ObjectId | null,
    excludeId?: string
  ): Promise<void> {
    const filter: Record<string, unknown> = {
      name: name.trim(),
      parent,
    };

    if (excludeId) {
      filter._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const existingCategory = await Category.findOne(filter).collation({
      locale: 'en',
      strength: 2,
    });

    if (existingCategory) {
      throw ApiError.conflict(
        'A category with this name already exists under this parent'
      );
    }
  }

  private async checkParentExists(parentId: Types.ObjectId | null): Promise<void> {
    if (!parentId) return;

    const parentExists = await Category.exists({ _id: parentId });

    if (!parentExists) {
      throw ApiError.notFound('Parent category not found');
    }
  }

  private async checkCircularRelationship(
    categoryId: string,
    parentId: Types.ObjectId | null
  ): Promise<void> {
    if (!parentId) return;

    let currentParentId: Types.ObjectId | null = parentId;

    while (currentParentId) {
      if (currentParentId.toString() === categoryId) {
        throw ApiError.badRequest(
          'A category cannot be its own parent or a descendant of itself'
        );
      }

      const parentCategory: { parent: Types.ObjectId | null } | null =
        await Category.findById(currentParentId)
          .select('parent')
          .lean<{ parent: Types.ObjectId | null }>();

      if (!parentCategory) {
        throw ApiError.notFound('Parent category not found');
      }

      currentParentId = parentCategory.parent
        ? new Types.ObjectId(parentCategory.parent.toString())
        : null;
    }
  }

  async getAllCategories() {
    return Category.find().sort({ name: 1 }).lean();
  }

  async getCategoryTree(): Promise<CategoryTreeNode[]> {
    const categories = await Category.find().sort({ name: 1 }).lean();

    const categoryMap = new Map<string, CategoryTreeNode>();

    for (const category of categories) {
      const id = category._id.toString();

      categoryMap.set(id, {
        _id: id,
        name: category.name,
        description: category.description,
        parent: category.parent?.toString() ?? null,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        children: [],
      });
    }

    const roots: CategoryTreeNode[] = [];

    for (const category of categoryMap.values()) {
      if (category.parent) {
        const parent = categoryMap.get(category.parent);

        if (parent) {
          parent.children.push(category);
        } else {
          // Keep orphaned categories visible instead of silently losing them.
          roots.push(category);
        }
      } else {
        roots.push(category);
      }
    }

    return roots;
  }

  async getCategoryById(categoryId: string) {
    const category = await Category.findById(categoryId).lean();

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    return category;
  }

  async createCategory(input: CreateCategoryInput) {

    //by default mongoose explicitly convert id to type.objectId (we have mention in the model partent is of cat-ref )
    // just mention explicitly for my understanding
    const parentId = input.parent ? new Types.ObjectId(input.parent) : null;   

    await this.checkParentExists(parentId);
    await this.checkDuplicateName(input.name, parentId);

    try {
      const category = await Category.create({
        name: input.name.trim(),
        description: input.description,
        parent: parentId,
      });

      return category.toObject();
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw ApiError.conflict(
          'A category with this name already exists under this parent'
        );
      }

      throw error;
    }
  }

  async updateCategory(categoryId: string, input: UpdateCategoryInput) {
    const category = await Category.findById(categoryId);

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    const newName = input.name?.trim() ?? category.name;

    const newParentId =
      input.parent !== undefined
        ? input.parent
          ? new Types.ObjectId(input.parent)
          : null
        : category.parent;

    if (input.parent !== undefined) {
      await this.checkParentExists(newParentId);
      await this.checkCircularRelationship(categoryId, newParentId);
    }

    if (input.name !== undefined || input.parent !== undefined) {
      await this.checkDuplicateName(newName, newParentId, categoryId);
    }

    category.name = newName;

    if (input.description !== undefined) {
      category.description = input.description;
    }

    if (input.parent !== undefined) {
      category.parent = newParentId;
    }

    try {
      await category.save();
      return category.toObject();
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw ApiError.conflict(
          'A category with this name already exists under this parent'
        );
      }

      throw error;
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const category = await Category.findById(categoryId);

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    const hasChildren = await Category.exists({
      parent: category._id,
    });

    if (hasChildren) {
      throw ApiError.badRequest('Cannot delete a category that has child categories');
    }

    // Prevent deletion if products are assigned to this category
    const hasProducts = await Product.exists({
      category: category._id,
    });

    if (hasProducts) {
      throw ApiError.badRequest(
        'Cannot delete a category that has products assigned to it'
      );
    }
    await category.deleteOne();
  }
}

export const categoryService = new CategoryService();

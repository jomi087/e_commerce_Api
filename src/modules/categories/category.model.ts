import { Schema, model, Types, type Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  parent: Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
    },

    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

categorySchema.index(
  { parent: 1, name: 1 },
  {
    unique: true, // Prevents duplicate category names under the same parent category.
    collation: { locale: 'en', strength: 2 },
  }
);

export const Category = model<ICategory>('Category', categorySchema);

import { Schema, model, type Document, type Types } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  description: string;
  price: number;
  salePrice: number | null;
  images: string[];
  stock: number;
  category: Types.ObjectId;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },

    sku: {
      type: String,
      required: [true, 'Product SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },

    salePrice: {
      type: Number,
      default: null,
      min: [0, 'Sale price cannot be negative'],
      validate: {
        validator: function (value: number | null) {
          const price = this.get('price');
          return value === null || value <= price;
        },
        message: 'Sale price cannot exceed original price',
      },
    },

    // images: {
    //   type: [String],
    //   default: [],
    // },

    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Stock must be an integer',
      },
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ category: 1 });

export const Product = model<IProduct>('Product', productSchema);

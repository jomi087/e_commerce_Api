import { Schema, model, type Document } from 'mongoose';

import { NAME_MIN_LENGTH, NAME_MAX_LENGTH } from '../../constants/auth.constants.js';

import {
  USER_ROLES,
  USER_ROLES_ARRAY,
  type UserRole,
} from '../../constants/roles.constants.js';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [NAME_MIN_LENGTH, `Name must be at least ${NAME_MIN_LENGTH} characters`],
      maxlength: [NAME_MAX_LENGTH, `Name cannot exceed ${NAME_MAX_LENGTH} characters`],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },

    role: {
      type: String,
      enum: USER_ROLES_ARRAY,
      default: USER_ROLES.CUSTOMER,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', userSchema);

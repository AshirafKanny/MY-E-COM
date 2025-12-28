import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  stock: number;
  isFeatured: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Product = model<IProduct>("Product", ProductSchema);

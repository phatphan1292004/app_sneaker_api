import mongoose, { Schema, Document } from "mongoose";

export interface IProductVariant extends Document {
  product_id: mongoose.Types.ObjectId;
  color: string;
  size: string;
  stock: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema: Schema = new Schema(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "product_variants",
  }
);

ProductVariantSchema.index(
  { product_id: 1, color: 1, size: 1 },
  { unique: true }
);

export const ProductVariant = mongoose.model<IProductVariant>(
  "ProductVariant",
  ProductVariantSchema
);

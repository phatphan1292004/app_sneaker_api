import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  brand_id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  base_price: number;
  views: number;
  sold: number;
  favorites: number;
  images: string[];
  discount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    brand_id: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    base_price: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    favorites: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "products",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate cho product_variants
ProductSchema.virtual("variants", {
  ref: "ProductVariant",
  localField: "_id",
  foreignField: "product_id",
});

ProductSchema.virtual("brand", {
  ref: "Brand",
  localField: "brand_id",
  foreignField: "_id",
  justOne: true,
});
export const Product = mongoose.model<IProduct>("Product", ProductSchema);

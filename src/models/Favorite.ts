import mongoose, { Schema, Document } from "mongoose";

export interface IFavorite extends Document {
  user_id: mongoose.Types.ObjectId;
  product_id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;  
}

const FavoriteSchema: Schema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { 
    timestamps: true,
    collection: "favorites",
  }
);

// Tạo compound index để đảm bảo một user chỉ có thể yêu thích một sản phẩm một lần
FavoriteSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

export const Favorite = mongoose.model<IFavorite>("Favorite", FavoriteSchema);
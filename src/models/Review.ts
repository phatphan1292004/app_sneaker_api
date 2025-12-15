import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  product_id: Types.ObjectId;
  user_id: String;
  content: string;
  rating?: number;
  parent_id?: Types.ObjectId | null;
  root_id?: Types.ObjectId | null;
  level: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ReviewSchema: Schema = new Schema<IReview>({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  user_id: { type: String, required: true },
  content: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  parent_id: { type: Schema.Types.ObjectId, ref: 'Review', default: null },
  root_id: { type: Schema.Types.ObjectId, ref: 'Review', default: null },
  level: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  user_id: string;
  type: string;
  street: string;
  province: string;
  district: string;
  ward: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema: Schema = new Schema(
  {
    user_id: { type: String, required: true },
    type: { type: String, required: true },
    street: { type: String, required: true },
    province: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: 'addresses',
  }
);

export const Address = mongoose.model<IAddress>('Address', AddressSchema);
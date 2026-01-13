import mongoose, { Schema, Document } from "mongoose";

export type VoucherType = "percent" | "fixed";
export type VoucherStatus = "active" | "expired";

export interface IVoucher extends Document {
  code: string; // unique
  type: VoucherType;
  value: number;

  minOrder?: number;
  maxDiscount?: number; // chỉ cho percent
  usageLimit?: number;
  used: number;

  startAt: Date;
  endAt: Date;

  status: VoucherStatus; // bật/tắt thủ công
  createdAt: Date;
  updatedAt: Date;
}

const VoucherSchema = new Schema<IVoucher>(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true, min: 1 },

    minOrder: { type: Number },
    maxDiscount: { type: Number },
    usageLimit: { type: Number },
    used: { type: Number, default: 0 },

    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },

    status: { type: String, enum: ["active", "expired"], default: "active" },
  },
  { timestamps: true, collection: "vouchers" }
);

// text search (tuỳ chọn)
VoucherSchema.index({ code: "text" });

export const Voucher = mongoose.model<IVoucher>("Voucher", VoucherSchema);

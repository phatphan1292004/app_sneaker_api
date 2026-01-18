import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  brand: string;
  product_id: mongoose.Types.ObjectId;
  variant_id: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IShippingAddress {
  street: string;
  ward: string;
  district: string;
  province: string;
  country: string;
}

export interface IOrder extends Document {
  user_id: string; // Firebase UID
  items: IOrderItem[];
  shipping_address: IShippingAddress;
  payment_method: string;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  brand: {
    type: String,
  },

  product_id: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variant_id: {
    type: Schema.Types.ObjectId,
    ref: "ProductVariant",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const ShippingAddressSchema = new Schema({
  street: {
    type: String,
    required: true,
  },
  ward: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  province: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});

const OrderSchema: Schema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: "Order must have at least one item",
      },
    },
    shipping_address: {
      type: ShippingAddressSchema,
      required: true,
    },
    payment_method: {
      type: String,
      required: true,
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
    collection: "orders",
  },
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);

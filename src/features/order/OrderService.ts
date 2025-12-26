import { Order, IOrderItem } from "../../models/Order";
import { Product } from "../../models/Product";
import { ProductVariant } from "../../models/ProductVariant";
import { User } from "../../models/User";
import mongoose from "mongoose";

export interface CreateOrderData {
  user_id: string;
  items: IOrderItem[];
  shipping_address: {
    street: string;
    province: string;
    district: string;
    ward: string;
    country: string;
  };
  payment_method: string;
  total_amount: number;
}

export class OrderService {
  // Tạo order mới
  async createOrder(orderData: CreateOrderData) {
    try {
      // Validate user exists by firebaseUid
      const user = await User.findOne({ firebaseUid: orderData.user_id });
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // Validate products and variants exist
      for (const item of orderData.items) {
        const product = await Product.findById(item.product_id);
        if (!product) {
          return {
            success: false,
            message: `Product with id ${item.product_id} not found`,
          };
        }

        const variant = await ProductVariant.findById(item.variant_id);
        if (!variant) {
          return {
            success: false,
            message: `Product variant with id ${item.variant_id} not found`,
          };
        }

        // Check stock availability
        if (variant.stock < item.quantity) {
          return {
            success: false,
            message: `Insufficient stock for product variant ${item.variant_id}. Available: ${variant.stock}`,
          };
        }
      }

      // Create order
      const order = await Order.create(orderData);

      // Update stock for each variant
      for (const item of orderData.items) {
        await ProductVariant.findByIdAndUpdate(item.variant_id, {
          $inc: { stock: -item.quantity },
        });

        // Update product sold count
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: { sold: item.quantity },
        });
      }

      // Populate order details
      const populatedOrder = await Order.findById(order._id)
        .populate({
          path: "items.product_id",
          select: "name image brand",
        })
        .populate({
          path: "items.variant_id",
          select: "color size price",
        });

      return {
        success: true,
        data: populatedOrder,
        message: "Order created successfully",
      };
    } catch (error: any) {
      console.error("Error in createOrder:", error);
      throw new Error(`Error creating order: ${error.message}`);
    }
  }

  // Lấy danh sách orders của user
  async getUserOrders(userId: string) {
    try {
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      const orders = await Order.find({ user_id: userId })
        .populate({
          path: "items.product_id",
          select: "name images description",
        })
        .populate({
          path: "items.variant_id",
          select: "color size price",
        })
        .sort({ createdAt: -1 });

      return {
        success: true,
        data: orders,
        count: orders.length,
      };
    } catch (error: any) {
      throw new Error(`Error fetching user orders: ${error.message}`);
    }
  }

  // Lấy chi tiết order
  async getOrderById(orderId: string) {
    try {
      const order = await Order.findById(orderId)
        .populate({
          path: "items.product_id",
          select: "name images description",
        })
        .populate({
          path: "items.variant_id",
          select: "color size price stock",
        });

      if (!order) {
        return {
          success: false,
          message: "Order not found",
        };
      }

      return {
        success: true,
        data: order,
      };
    } catch (error: any) {
      throw new Error(`Error fetching order: ${error.message}`);
    }
  }

  async updateOrderStatus(
    orderId: string,
    status: "pending" | "paid" | "failed" | "cancelled"
  ) {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );
      if (!order) {
        return { success: false, message: "Order not found" };
      }
      return { success: true, data: order };
    } catch (error: any) {
      console.error("updateOrderStatus error:", error);
      return { success: false, message: error.message };
    }
  }

  async cancelOrder(orderId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const order = await Order.findById(orderId).session(session);

      if (!order) {
        await session.abortTransaction();
        return { success: false, message: "Order not found" };
      }

      // chỉ cho hủy khi pending
      if ((order.status || "").toLowerCase() !== "pending") {
        await session.abortTransaction();
        return {
          success: false,
          message: "Only pending orders can be cancelled",
        };
      }

      // hoàn kho + trừ sold
      for (const item of order.items) {
        await ProductVariant.findByIdAndUpdate(
          item.variant_id,
          { $inc: { stock: item.quantity } },
          { session }
        );

        // trừ sold (đảm bảo không âm)
        const product = await Product.findById(item.product_id).session(
          session
        );
        if (product) {
          const newSold = Math.max(0, (product.sold || 0) - item.quantity);
          product.sold = newSold;
          await product.save({ session });
        }
      }

      order.status = "cancelled";
      await order.save({ session });

      await session.commitTransaction();

      return {
        success: true,
        message: "Order cancelled and stock restored",
        data: order,
      };
    } catch (error: any) {
      await session.abortTransaction();
      console.error("cancelOrder error:", error);
      return { success: false, message: error.message };
    } finally {
      session.endSession();
    }
  }

  async reorderFromOrder(orderId: string) {
    try {
      const oldOrder = await Order.findById(orderId);

      if (!oldOrder) {
        return { success: false, message: "Order not found" };
      }

      const st = (oldOrder.status || "").toLowerCase();

      if (st !== "paid" && st !== "cancelled") {
        return {
          success: false,
          message: "Only paid/cancelled orders can be reordered",
        };
      }
      const items = oldOrder.items.map((it: any) => ({
        product_id: String(it.product_id),
        variant_id: String(it.variant_id),
        quantity: it.quantity,
      }));

      return {
        success: true,
        message: "Reorder payload generated",
        data: {
          order_id: String(oldOrder._id),
          items,
        },
      };
    } catch (error: any) {
      console.error("reorderFromOrder error:", error);
      return { success: false, message: error.message };
    }
  }
}

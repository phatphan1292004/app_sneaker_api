import { Order, IOrderItem } from '../../models/Order';
import { Product } from '../../models/Product';
import { ProductVariant } from '../../models/ProductVariant';
import { User } from '../../models/User';

export interface CreateOrderData {
  user_id: string;
  items: IOrderItem[];
  shipping_address: {
    street: string;
    city: string;
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
          message: 'User not found',
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
          path: 'items.product_id',
          select: 'name image',
        })
        .populate({
          path: 'items.variant_id',
          select: 'color size price',
        });

      return {
        success: true,
        data: populatedOrder,
        message: 'Order created successfully',
      };
    } catch (error: any) {
      console.error('Error in createOrder:', error);
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
          message: 'User not found',
        };
      }

      const orders = await Order.find({ user_id: userId })
        .populate({
          path: 'items.product_id',
          select: 'name image',
        })
        .populate({
          path: 'items.variant_id',
          select: 'color size price',
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
          path: 'items.product_id',
          select: 'name image description',
        })
        .populate({
          path: 'items.variant_id',
          select: 'color size price stock',
        });

      if (!order) {
        return {
          success: false,
          message: 'Order not found',
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
}

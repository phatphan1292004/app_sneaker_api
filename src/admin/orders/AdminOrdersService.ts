import mongoose from "mongoose";
import { Order } from "../../models/Order";
import { User } from "../../models";

type SortDir = 1 | -1;

function parseSort(sortRaw?: string) {
  const sort = String(sortRaw || "-createdAt").trim();
  const dir: SortDir = sort.startsWith("-") ? -1 : 1;
  const field = sort.replace(/^-/, "") || "createdAt";
  return { [field]: dir } as Record<string, SortDir>;
}

const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

function isOrderStatus(x: any): x is OrderStatus {
  return ORDER_STATUSES.includes(String(x) as any);
}

export class AdminOrdersService {
  async listOrders(opts: {
    q?: string;
    status?: string; // "all" | OrderStatus
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const q = String(opts.q || "").trim();
    const statusRaw = String(opts.status || "all").trim();
    const page = Math.max(1, Number(opts.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(opts.limit) || 30));
    const skip = (page - 1) * limit;

    const filter: any = {};

    // filter status
    if (statusRaw !== "all") {
      if (!isOrderStatus(statusRaw)) {
        return { success: false, message: "Invalid status filter" };
      }
      filter.status = statusRaw;
    }

    // search q
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { user_id: rx },
        { payment_method: rx },
        { $expr: { $regexMatch: { input: { $toString: "$_id" }, regex: rx } } },
      ];
    }

    const sort = parseSort(opts.sort);

    // ✅ lean() để items là plain object
    const [items, total] = await Promise.all([
      Order.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter),
    ]);

    // ✅ lấy danh sách firebaseUid từ orders
    const uids = Array.from(
      new Set(
        items.map((o: any) => String(o.user_id || "").trim()).filter(Boolean),
      ),
    );

    // ✅ map firebaseUid -> username
    const users = uids.length
      ? await User.find({ firebaseUid: { $in: uids } })
          .select("firebaseUid username")
          .lean()
      : [];

    const uidToName = new Map<string, string>(
      users.map((u: any) => [String(u.firebaseUid), String(u.username)]),
    );

    // ✅ trả về _id là string + user_name
    const data = items.map((o: any) => ({
      ...o,
      _id: String(o._id), // 🔥 fix slice undefined
      user_name: uidToName.get(String(o.user_id)) || String(o.user_id),
    }));

    return {
      success: true,
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async getOrderById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid order id" };
    }
    const order = await Order.findById(id)
      .populate("items.product_id", "name images")
      .populate("items.variant_id", "color size");

    if (!order) return { success: false, message: "Order not found" };
    return { success: true, data: order };
  }

  async updateOrder(
    id: string,
    patch: Partial<{
      status: OrderStatus;
      payment_method: string;
      shipping_address: any;
      items: any[];
      total_amount: number;
    }>,
  ) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid order id" };
    }

    const update: any = {};

    if (patch.status != null) {
      const s = String(patch.status).trim();
      if (!isOrderStatus(s)) {
        return { success: false, field: "status", message: "Invalid status" };
      }
      update.status = s;
    }

    if (patch.payment_method != null) {
      update.payment_method = String(patch.payment_method).trim();
    }

    if (patch.total_amount != null) {
      update.total_amount = Number(patch.total_amount) || 0;
    }

    if (patch.shipping_address != null) {
      update.shipping_address = patch.shipping_address;
    }

    if (patch.items != null) {
      update.items = patch.items;
    }

    const order = await Order.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!order) return { success: false, message: "Order not found" };
    return { success: true, data: order };
  }

  async deleteOrder(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid order id" };
    }
    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) return { success: false, message: "Order not found" };
    return { success: true, data: deleted };
  }

  async updateStatus(id: string, statusRaw: any) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid order id" };
    }

    const status = String(statusRaw || "").trim();

    if (!isOrderStatus(status)) {
      return { success: false, message: "Invalid status", field: "status" };
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!order) return { success: false, message: "Order not found" };

    return { success: true, data: order };
  }
}

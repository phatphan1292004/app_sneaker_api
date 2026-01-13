import { Order } from "../../models/Order";
import { Product } from "../../models/Product";
import { Brand } from "../../models/Brand";
import { User } from "../../models/User";

// ✅ status chuẩn
const PAID_STATUSES = ["paid", "shipped", "delivered"] as const;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export class AdminDashboardService {
  async getDashboard(opts: { days: number }) {
    const days = Math.max(1, Math.min(30, Number(opts.days || 7)));

    const now = new Date();
    const from = startOfDay(new Date(now.getTime() - (days - 1) * 86400000));

    // ===== COUNT CARDS =====
    const [usersCount, brandsCount, productsCount, ordersCount] =
      await Promise.all([
        User.countDocuments({}),
        Brand.countDocuments({}),
        Product.countDocuments({}),
        Order.countDocuments({}),
      ]);

    // ===== REVENUE PAID (all time) =====
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $in: [...PAID_STATUSES] } } },
      { $group: { _id: null, total: { $sum: "$total_amount" } } },
    ]);
    const revenuePaid = Number(revenueAgg?.[0]?.total || 0);

    // ===== REVENUE LAST N DAYS (chart) =====
    const chartAgg = await Order.aggregate([
      {
        $match: {
          status: { $in: [...PAID_STATUSES] },
          createdAt: { $gte: from, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            y: { $year: "$createdAt" },
            m: { $month: "$createdAt" },
            d: { $dayOfMonth: "$createdAt" },
          },
          total: { $sum: "$total_amount" },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
    ]);

    // build list đủ ngày (fill 0)
    const chart: { date: string; total: number }[] = [];
    const map = new Map<string, number>();
    for (const row of chartAgg) {
      const { y, m, d } = row._id;
      const key = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(
        2,
        "0"
      )}`;
      map.set(key, Number(row.total || 0));
    }
    for (let i = 0; i < days; i++) {
      const date = new Date(from.getTime() + i * 86400000);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
      chart.push({ date: key, total: map.get(key) || 0 });
    }

    // ===== TOP SELLING PRODUCTS =====
    const topSelling = await Product.find({})
      .sort({ sold: -1, updatedAt: -1 })
      .limit(5)
      .select("_id name sold base_price brand_id images");

    // ===== RECENT ORDERS =====
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .select("_id status total_amount items payment_method createdAt user_id");

    return {
      success: true,
      data: {
        stats: {
          users: usersCount,
          brands: brandsCount,
          products: productsCount,
          orders: ordersCount,
        },
        revenuePaid,
        revenueLastDays: chart, // [{date:'2026-01-14', total:123}]
        topSelling,
        recentOrders,
      },
    };
  }
}

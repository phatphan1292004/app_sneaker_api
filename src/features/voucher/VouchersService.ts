import { Voucher } from "../../models/Voucher";

function roundMoney(v: number) {
  return Math.max(0, Math.floor(v));
}

export class VouchersService {
  async applyVoucher(opts: { code?: any; subtotal?: any }) {
    const code = String(opts.code || "")
      .trim()
      .toUpperCase();
    const subtotal = Number(opts.subtotal) || 0;

    if (!code)
      return { success: false, field: "code", message: "Missing code" };
    if (subtotal <= 0)
      return { success: false, field: "subtotal", message: "Invalid subtotal" };

    const v = await Voucher.findOne({ code });
    if (!v) return { success: false, message: "Voucher not found" };

    const now = Date.now();
    const start = +new Date(v.startAt);
    const end = +new Date(v.endAt);

    // check manual status + thời gian
    if (v.status !== "active") {
      return { success: false, message: "Voucher is not active" };
    }
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      return { success: false, message: "Voucher time invalid" };
    }
    if (now < start)
      return { success: false, message: "Voucher not started yet" };
    if (now > end) return { success: false, message: "Voucher expired" };

    // check minOrder
    if (v.minOrder != null && subtotal < v.minOrder) {
      return {
        success: false,
        message: `Order must be at least ${v.minOrder}`,
      };
    }

    // check usageLimit
    if (v.usageLimit != null && v.used >= v.usageLimit) {
      return { success: false, message: "Voucher usage limit reached" };
    }

    // compute discount
    let discount = 0;

    if (v.type === "fixed") {
      discount = Math.min(subtotal, v.value);
    } else {
      // percent
      discount = (subtotal * v.value) / 100;
      if (v.maxDiscount != null) discount = Math.min(discount, v.maxDiscount);
    }

    discount = roundMoney(discount);
    const total = roundMoney(subtotal - discount);

    return {
      success: true,
      data: {
        code: v.code,
        type: v.type,
        value: v.value,
        minOrder: v.minOrder ?? null,
        maxDiscount: v.maxDiscount ?? null,
        usageLimit: v.usageLimit ?? null,
        used: v.used ?? 0,
        startAt: v.startAt,
        endAt: v.endAt,
        discount,
        subtotal,
        total,
      },
    };
  }
}

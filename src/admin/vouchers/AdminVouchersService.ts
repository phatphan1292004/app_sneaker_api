import mongoose from "mongoose";
import { Voucher } from "../../models/Voucher";

type SortDir = 1 | -1;

function parseSort(sortRaw?: string) {
  const sort = String(sortRaw || "-createdAt").trim();
  const dir: SortDir = sort.startsWith("-") ? -1 : 1;
  const field = sort.replace(/^-/, "") || "createdAt";
  return { [field]: dir } as Record<string, SortDir>;
}

const VOUCHER_TYPES = ["percent", "fixed"] as const;
type VoucherType = (typeof VOUCHER_TYPES)[number];
function isVoucherType(x: any): x is VoucherType {
  return VOUCHER_TYPES.includes(String(x) as any);
}

const VOUCHER_STATUSES = ["active", "expired"] as const;
type VoucherStatus = (typeof VOUCHER_STATUSES)[number];
function isVoucherStatus(x: any): x is VoucherStatus {
  return VOUCHER_STATUSES.includes(String(x) as any);
}

function escRx(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class AdminVouchersService {
  async listVouchers(opts: {
    q?: string;
    status?: string; // all | active | expired
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const q = String(opts.q || "").trim();
    const statusRaw = String(opts.status || "all").trim();
    const page = Math.max(1, Number(opts.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(opts.limit) || 30));
    const skip = (page - 1) * limit;
    const sort = parseSort(opts.sort);

    const filter: any = {};
    if (statusRaw !== "all") {
      if (!isVoucherStatus(statusRaw)) {
        return { success: false, message: "Invalid status filter" };
      }
      filter.status = statusRaw;
    }

    if (q) {
      const rx = new RegExp(escRx(q), "i");
      filter.$or = [
        { code: rx },
        { $expr: { $regexMatch: { input: { $toString: "$_id" }, regex: rx } } },
      ];
    }

    const [items, total] = await Promise.all([
      Voucher.find(filter).sort(sort).skip(skip).limit(limit),
      Voucher.countDocuments(filter),
    ]);

    return {
      success: true,
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async getVoucherById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid voucher id" };
    }
    const item = await Voucher.findById(id);
    if (!item) return { success: false, message: "Voucher not found" };
    return { success: true, data: item };
  }

  async createVoucher(payload: any) {
    const code = String(payload?.code || "")
      .trim()
      .toUpperCase();
    const type = String(payload?.type || "").trim();
    const value = Number(payload?.value) || 0;

    const minOrder =
      payload?.minOrder != null ? Number(payload.minOrder) || 0 : undefined;
    const maxDiscount =
      payload?.maxDiscount != null
        ? Number(payload.maxDiscount) || 0
        : undefined;
    const usageLimit =
      payload?.usageLimit != null ? Number(payload.usageLimit) || 0 : undefined;

    const used = payload?.used != null ? Number(payload.used) || 0 : 0;

    const startAt = new Date(payload?.startAt);
    const endAt = new Date(payload?.endAt);

    const status = String(payload?.status || "active").trim();

    if (!code)
      return { success: false, field: "code", message: "Missing code" };
    if (!isVoucherType(type))
      return { success: false, field: "type", message: "Invalid type" };
    if (value <= 0)
      return { success: false, field: "value", message: "Value must be > 0" };
    if (type === "percent" && value > 100)
      return { success: false, field: "value", message: "Percent max 100" };

    if (!Number.isFinite(+startAt))
      return { success: false, field: "startAt", message: "Invalid startAt" };
    if (!Number.isFinite(+endAt))
      return { success: false, field: "endAt", message: "Invalid endAt" };
    if (+endAt <= +startAt)
      return {
        success: false,
        field: "endAt",
        message: "endAt must be > startAt",
      };

    if (!isVoucherStatus(status))
      return { success: false, field: "status", message: "Invalid status" };

    if (type === "fixed") {
      // fixed thì không dùng maxDiscount
    } else {
      // percent: nếu có maxDiscount thì phải > 0
      if (maxDiscount != null && maxDiscount <= 0)
        return {
          success: false,
          field: "maxDiscount",
          message: "maxDiscount must be > 0",
        };
    }

    // minOrder/usageLimit nếu có thì phải > 0
    if (minOrder != null && minOrder <= 0)
      return {
        success: false,
        field: "minOrder",
        message: "minOrder must be > 0",
      };
    if (usageLimit != null && usageLimit <= 0)
      return {
        success: false,
        field: "usageLimit",
        message: "usageLimit must be > 0",
      };

    try {
      const created = await Voucher.create({
        code,
        type,
        value,
        minOrder: minOrder && minOrder > 0 ? minOrder : undefined,
        maxDiscount:
          type === "percent" && maxDiscount && maxDiscount > 0
            ? maxDiscount
            : undefined,
        usageLimit: usageLimit && usageLimit > 0 ? usageLimit : undefined,
        used,
        startAt,
        endAt,
        status,
      });

      return { success: true, data: created };
    } catch (e: any) {
      // duplicate code
      if (e?.code === 11000) {
        return {
          success: false,
          field: "code",
          message: "Code already exists",
        };
      }
      return { success: false, message: e?.message || "Create failed" };
    }
  }

  async updateVoucher(id: string, patch: any) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid voucher id" };
    }

    const update: any = {};

    if (patch.code != null) {
      const code = String(patch.code).trim().toUpperCase();
      if (!code)
        return { success: false, field: "code", message: "Code is required" };
      update.code = code;
    }

    if (patch.type != null) {
      const type = String(patch.type).trim();
      if (!isVoucherType(type))
        return { success: false, field: "type", message: "Invalid type" };
      update.type = type;
    }

    if (patch.value != null) {
      const value = Number(patch.value) || 0;
      if (value <= 0)
        return { success: false, field: "value", message: "Value must be > 0" };
      update.value = value;
    }

    if (patch.minOrder != null) {
      const minOrder = Number(patch.minOrder) || 0;
      update.minOrder = minOrder > 0 ? minOrder : undefined;
    }

    if (patch.maxDiscount != null) {
      const max = Number(patch.maxDiscount) || 0;
      update.maxDiscount = max > 0 ? max : undefined;
    }

    if (patch.usageLimit != null) {
      const lim = Number(patch.usageLimit) || 0;
      update.usageLimit = lim > 0 ? lim : undefined;
    }

    if (patch.used != null) {
      const used = Number(patch.used) || 0;
      update.used = used >= 0 ? used : 0;
    }

    if (patch.startAt != null) {
      const d = new Date(patch.startAt);
      if (!Number.isFinite(+d))
        return { success: false, field: "startAt", message: "Invalid startAt" };
      update.startAt = d;
    }

    if (patch.endAt != null) {
      const d = new Date(patch.endAt);
      if (!Number.isFinite(+d))
        return { success: false, field: "endAt", message: "Invalid endAt" };
      update.endAt = d;
    }

    if (patch.status != null) {
      const s = String(patch.status).trim();
      if (!isVoucherStatus(s))
        return { success: false, field: "status", message: "Invalid status" };
      update.status = s;
    }

    // validate thêm: nếu đổi type/value
    if (
      update.type === "percent" &&
      update.value != null &&
      update.value > 100
    ) {
      return { success: false, field: "value", message: "Percent max 100" };
    }

    try {
      const item = await Voucher.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true,
      });
      if (!item) return { success: false, message: "Voucher not found" };
      return { success: true, data: item };
    } catch (e: any) {
      if (e?.code === 11000) {
        return {
          success: false,
          field: "code",
          message: "Code already exists",
        };
      }
      return { success: false, message: e?.message || "Update failed" };
    }
  }

  async deleteVoucher(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid voucher id" };
    }
    const deleted = await Voucher.findByIdAndDelete(id);
    if (!deleted) return { success: false, message: "Voucher not found" };
    return { success: true, data: deleted };
  }
}

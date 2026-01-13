import mongoose from "mongoose";
import { User } from "../../models";

type SortDir = 1 | -1;

function parseSort(sortRaw?: string) {
  const sort = String(sortRaw || "-createdAt").trim();
  // hỗ trợ: "-createdAt" | "createdAt" | "-username" ...
  const dir: SortDir = sort.startsWith("-") ? -1 : 1;
  const field = sort.replace(/^-/, "") || "createdAt";
  return { [field]: dir } as Record<string, SortDir>;
}

export class AdminUsersService {
  async listUsers(opts: {
    q?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const q = String(opts.q || "").trim();
    const page = Math.max(1, Number(opts.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(opts.limit) || 50));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { email: regex },
        { username: regex },
        { firebaseUid: regex },
      ];
    }

    const sort = parseSort(opts.sort);

    const [items, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return {
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getUserById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid user id" };
    }
    const user = await User.findById(id);
    if (!user) return { success: false, message: "User not found" };
    return { success: true, data: user };
  }

  async createUser(payload: {
    firebaseUid: string;
    username: string;
    email: string;
    avatar?: string;
    phoneNumber?: string;
    birthDate?: string;
    gender?: string;
  }) {
    const firebaseUid = String(payload.firebaseUid || "").trim();
    const username = String(payload.username || "").trim();
    const email = String(payload.email || "")
      .trim()
      .toLowerCase();

    if (!firebaseUid || !username || !email) {
      return {
        success: false,
        message: "Missing required fields: firebaseUid, username, email",
      };
    }

    // check trùng firebaseUid hoặc email
    const existing = await User.findOne({
      $or: [{ firebaseUid }, { email }],
    });

    if (existing) {
      return {
        success: false,
        message: "User already exists (firebaseUid/email duplicated)",
        data: existing,
      };
    }

    const newUser = await User.create({
      firebaseUid,
      username,
      email,
      avatar: payload.avatar?.trim() || undefined,
      phoneNumber: payload.phoneNumber?.trim() || undefined,
      birthDate: payload.birthDate?.trim() || undefined,
      gender: payload.gender?.trim() || undefined,
    });

    return { success: true, data: newUser };
  }

  async updateUser(
    id: string,
    patch: Partial<{
      firebaseUid: string;
      username: string;
      email: string;
      avatar: string;
      phoneNumber: string;
      birthDate: string;
      gender: string;
    }>
  ) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid user id" };
    }

    const update: any = {};
    if (patch.username != null) update.username = String(patch.username).trim();
    if (patch.email != null)
      update.email = String(patch.email).trim().toLowerCase();
    if (patch.firebaseUid != null)
      update.firebaseUid = String(patch.firebaseUid).trim();
    if (patch.avatar != null)
      update.avatar = String(patch.avatar).trim() || undefined;
    if (patch.phoneNumber != null)
      update.phoneNumber = String(patch.phoneNumber).trim() || undefined;
    if (patch.birthDate != null)
      update.birthDate = String(patch.birthDate).trim() || undefined;
    if (patch.gender != null)
      update.gender = String(patch.gender).trim() || undefined;

    // nếu đổi email/firebaseUid -> check trùng
    if (update.email || update.firebaseUid) {
      const dup = await User.findOne({
        _id: { $ne: id },
        $or: [
          ...(update.email ? [{ email: update.email }] : []),
          ...(update.firebaseUid ? [{ firebaseUid: update.firebaseUid }] : []),
        ],
      });

      if (dup) {
        return {
          success: false,
          message: "Duplicate email/firebaseUid",
          data: dup,
        };
      }
    }

    const user = await User.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!user) return { success: false, message: "User not found" };
    return { success: true, data: user };
  }

  async deleteUser(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid user id" };
    }
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return { success: false, message: "User not found" };
    return { success: true, data: deleted };
  }
}

import mongoose from "mongoose";
import { Brand } from "../../models/Brand";

type SortDir = 1 | -1;

function parseSort(sortRaw?: string) {
  const sort = String(sortRaw || "-createdAt").trim();
  const dir: SortDir = sort.startsWith("-") ? -1 : 1;
  const field = sort.replace(/^-/, "") || "createdAt";
  return { [field]: dir } as Record<string, SortDir>;
}

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class AdminBrandsService {
  async listBrands(opts: {
    q?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const q = String(opts.q || "").trim();
    const page = Math.max(1, Number(opts.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(opts.limit) || 30));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (q) {
      const regex = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ name: regex }, { slug: regex }, { description: regex }];
    }

    const sort = parseSort(opts.sort);

    const [items, total] = await Promise.all([
      Brand.find(filter).sort(sort).skip(skip).limit(limit),
      Brand.countDocuments(filter),
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

  async getBrandById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid brand id" };
    }
    const brand = await Brand.findById(id);
    if (!brand) return { success: false, message: "Brand not found" };
    return { success: true, data: brand };
  }

  async createBrand(payload: {
    name: string;
    slug: string;
    logo: string;
    description?: string;
  }) {
    const name = payload.name.trim();
    const slug = payload.slug.trim();
    const logo = payload.logo.trim();

    if (!name || !slug || !logo) {
      return {
        success: false,
        message: "Missing required fields: name, slug, logo",
      };
    }

    // ✅ check trùng name
    const dupName = await Brand.findOne({ name });
    if (dupName) {
      return {
        success: false,
        field: "name",
        message: "Name đã tồn tại",
      };
    }

    // ✅ check trùng slug
    const dupSlug = await Brand.findOne({ slug });
    if (dupSlug) {
      return {
        success: false,
        field: "slug",
        message: "Slug đã tồn tại",
      };
    }

    const brand = await Brand.create({
      name,
      slug,
      logo,
      description: payload.description?.trim() || "",
    });

    return { success: true, data: brand };
  }

  async updateBrand(
    id: string,
    patch: Partial<{
      name: string;
      slug: string;
      logo: string;
      description: string;
    }>
  ) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid brand id" };
    }

    const update: any = {};
    if (patch.name != null) update.name = patch.name.trim();
    if (patch.slug != null) update.slug = patch.slug.trim();
    if (patch.logo != null) update.logo = patch.logo.trim();
    if (patch.description != null)
      update.description = patch.description.trim();

    // ✅ check trùng name / slug (trừ chính nó)
    if (update.name) {
      const dupName = await Brand.findOne({
        _id: { $ne: id },
        name: update.name,
      });

      if (dupName) {
        return {
          success: false,
          field: "name",
          message: "Name đã tồn tại",
        };
      }
    }

    if (update.slug) {
      const dupSlug = await Brand.findOne({
        _id: { $ne: id },
        slug: update.slug,
      });

      if (dupSlug) {
        return {
          success: false,
          field: "slug",
          message: "Slug đã tồn tại",
        };
      }
    }

    const brand = await Brand.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!brand) {
      return { success: false, message: "Brand not found" };
    }

    return { success: true, data: brand };
  }

  async deleteBrand(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid brand id" };
    }
    const deleted = await Brand.findByIdAndDelete(id);
    if (!deleted) return { success: false, message: "Brand not found" };
    return { success: true, data: deleted };
  }
}

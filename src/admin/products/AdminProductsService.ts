import mongoose from "mongoose";
import { Product, ProductVariant } from "../../models";

type SortDir = 1 | -1;

function parseSort(sortRaw?: string) {
  const sort = String(sortRaw || "-createdAt").trim();
  const dir: SortDir = sort.startsWith("-") ? -1 : 1;
  const field = sort.replace(/^-/, "") || "createdAt";
  return { [field]: dir } as Record<string, SortDir>;
}

export class AdminProductsService {
  // ===== PRODUCTS =====

  async listProducts(opts: {
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
    if (q) filter.$text = { $search: q };

    const sort = parseSort(opts.sort);

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    return {
      success: true,
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async getProductById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return { success: false, message: "Invalid product id" };

    const product = await Product.findById(id);
    if (!product) return { success: false, message: "Product not found" };

    return { success: true, data: product };
  }

  async createProduct(payload: {
    brand_id: string;
    name: string;
    description: string;
    base_price: number;
    discount?: number;
    images: string[];
  }) {
    const brand_id = String(payload.brand_id || "").trim();
    const name = String(payload.name || "").trim();
    const description = String(payload.description || "").trim();
    const base_price = Number(payload.base_price) || 0;
    const discount = Number(payload.discount) || 0;

    const images = Array.isArray(payload.images)
      ? payload.images.map((x) => String(x).trim()).filter(Boolean)
      : [];

    if (!brand_id || !name || !description) {
      return {
        success: false,
        message: "Missing: brand_id, name, description",
      };
    }
    if (!images.length) {
      return { success: false, message: "Images is required (array)" };
    }

    const created = await Product.create({
      brand_id,
      name,
      description,
      base_price,
      discount,
      views: 0,
      sold: 0,
      favorites: 0,
      images,
    });

    return { success: true, data: created };
  }

  async updateProduct(
    id: string,
    patch: Partial<{
      brand_id: string;
      name: string;
      description: string;
      base_price: number;
      discount: number;
      images: string[];
      views: number;
      sold: number;
      favorites: number;
    }>
  ) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return { success: false, message: "Invalid product id" };

    const update: any = {};
    if (patch.brand_id != null) update.brand_id = String(patch.brand_id).trim();
    if (patch.name != null) update.name = String(patch.name).trim();
    if (patch.description != null)
      update.description = String(patch.description).trim();
    if (patch.base_price != null)
      update.base_price = Number(patch.base_price) || 0;
    if (patch.discount != null) update.discount = Number(patch.discount) || 0;

    if (patch.views != null) update.views = Number(patch.views) || 0;
    if (patch.sold != null) update.sold = Number(patch.sold) || 0;
    if (patch.favorites != null)
      update.favorites = Number(patch.favorites) || 0;

    if (patch.images != null) {
      const imgs = Array.isArray(patch.images)
        ? patch.images.map((x) => String(x).trim()).filter(Boolean)
        : [];
      update.images = imgs;
    }

    const product = await Product.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!product) return { success: false, message: "Product not found" };
    return { success: true, data: product };
  }

  async deleteProduct(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return { success: false, message: "Invalid product id" };

    // cascade variants đã nằm ở middleware pre("findOneAndDelete")
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return { success: false, message: "Product not found" };

    return { success: true, data: deleted };
  }

  // ===== VARIANTS =====

  async listVariants(productId: string) {
    if (!mongoose.Types.ObjectId.isValid(productId))
      return { success: false, message: "Invalid product id" };

    const product = await Product.findById(productId).select("_id");
    if (!product) return { success: false, message: "Product not found" };

    const items = await ProductVariant.find({ product_id: productId }).sort({
      updatedAt: -1,
    });
    return { success: true, data: items };
  }

  async createVariant(
    productId: string,
    payload: {
      color: string;
      size: string | number;
      stock: number;
      price: number;
    }
  ) {
    if (!mongoose.Types.ObjectId.isValid(productId))
      return { success: false, message: "Invalid product id" };

    const product = await Product.findById(productId).select("_id");
    if (!product) return { success: false, message: "Product not found" };

    const color = String(payload.color || "")
      .trim()
      .toUpperCase();
    const size = String(payload.size ?? "").trim();
    const stock = Number(payload.stock) || 0;
    const price = Number(payload.price) || 0;

    if (!color)
      return { success: false, field: "color", message: "Missing color" };
    if (!size)
      return { success: false, field: "size", message: "Missing size" };
    if (price <= 0)
      return { success: false, field: "price", message: "Price must be > 0" };

    // ✅ CHECK DUPLICATE
    const existed = await ProductVariant.findOne({
      product_id: productId,
      color,
      size,
    });

    if (existed) {
      return {
        success: false,
        field: "size",
        message: "Variant đã tồn tại (cùng color + size)",
        data: existed,
      };
    }

    try {
      const created = await ProductVariant.create({
        product_id: productId,
        color,
        size,
        stock,
        price,
      });

      return { success: true, data: created };
    } catch (e: any) {
      // fallback nếu vẫn trúng index
      if (e?.code === 11000) {
        return {
          success: false,
          field: "size",
          message: "Variant bị trùng (product + color + size)",
        };
      }
      throw e;
    }
  }

  async updateVariant(
    id: string,
    patch: Partial<{
      product_id: string;
      color: string;
      size: string | number;
      stock: number;
      price: number;
    }>
  ) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return { success: false, message: "Invalid variant id" };

    const current = await ProductVariant.findById(id);
    if (!current) return { success: false, message: "Variant not found" };

    const nextProductId = patch.product_id
      ? String(patch.product_id).trim()
      : String(current.product_id);

    const nextColor =
      patch.color != null
        ? String(patch.color).trim().toUpperCase()
        : current.color;

    const nextSize =
      patch.size != null ? String(patch.size).trim() : String(current.size);

    // ✅ CHECK DUP (trừ chính nó)
    const dup = await ProductVariant.findOne({
      _id: { $ne: id },
      product_id: nextProductId,
      color: nextColor,
      size: nextSize,
    });

    if (dup) {
      return {
        success: false,
        field: "size",
        message: "Variant đã tồn tại (cùng color + size)",
        data: dup,
      };
    }

    if (patch.product_id != null) current.product_id = nextProductId as any;
    if (patch.color != null) current.color = nextColor;
    if (patch.size != null) current.size = nextSize;
    if (patch.stock != null) current.stock = Number(patch.stock) || 0;
    if (patch.price != null) current.price = Number(patch.price) || 0;

    try {
      await current.save();
      return { success: true, data: current };
    } catch (e: any) {
      if (e?.code === 11000) {
        return {
          success: false,
          field: "size",
          message: "Variant bị trùng (product + color + size)",
        };
      }
      throw e;
    }
  }

  async deleteVariant(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return { success: false, message: "Invalid variant id" };

    const deleted = await ProductVariant.findByIdAndDelete(id);
    if (!deleted) return { success: false, message: "Variant not found" };

    return { success: true, data: deleted };
  }
}

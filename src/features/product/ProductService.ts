import { Product, Brand, User, Favorite } from "../../models";
import mongoose from "mongoose";

export class ProductService {
  async getAllProducts(query: any = {}) {
    const { brand, price, size, color, sort } = query;

    try {
      let match: any = {};

      // BRAND FILTER (brand là slug hoặc id tuỳ FE dùng gì)
      if (brand && brand !== "ALL") {
        match.brand_id = new mongoose.Types.ObjectId(brand);
      }

      // PRICE FILTER
      if (price === "UNDER_1000") match.base_price = { $lt: 1000000 };
      else if (price === "1000_3000")
        match.base_price = { $gte: 1000000, $lte: 3000000 };
      else if (price === "OVER_3000") match.base_price = { $gt: 3000000 };

      const pipeline: any[] = [
        { $match: match },
        {
          $lookup: {
            from: "product_variants",
            localField: "_id",
            foreignField: "product_id",
            as: "variants",
          },
        },
      ];

      // SIZE FILTER
      if (size && size !== "ALL") {
        const sizeNumber = parseInt(size, 10); // FE gửi string, convert sang number
        pipeline.push({
          $match: { variants: { $elemMatch: { size: sizeNumber } } },
        });
      }

      // COLOR FILTER
      if (color && color !== "ALL") {
        pipeline.push({
          $match: { "variants.color": color },
        });
      }

      // SORT
      if (sort === "LOW_HIGH") pipeline.push({ $sort: { base_price: 1 } });
      if (sort === "HIGH_LOW") pipeline.push({ $sort: { base_price: -1 } });

      const products = await Product.aggregate(pipeline);

      return {
        success: true,
        data: products,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getProductById(id: string) {
    try {
      const product = await Product.findById(id)
        .populate("brand_id")
        .populate("variants");

      if (!product) {
        return {
          success: false,
          message: "Product not found",
        };
      }

      return {
        success: true,
        data: product,
      };
    } catch (error: any) {
      throw new Error(`Error fetching product: ${error.message}`);
    }
  }

  async getProductsByBrand(brandId: string) {
    try {
      const products = await Product.find({ brand_id: brandId })
        .populate("brand_id")
        .populate("variants");
      const brand = await Brand.findById(brandId);

      return {
        success: true,
        data: products,
        brand: brand || null,
        count: products.length,
      };
    } catch (error: any) {
      throw new Error(`Error fetching products by brand: ${error.message}`);
    }
  }

  // For You: Sản phẩm có lượt xem cao
  async getForYouProducts(limit: number = 4) {
    try {
      const products = await Product.find()
        .populate("brand_id")
        .select("name base_price images brand_id discount")
        .sort({ views: -1 })
        .limit(limit);

      return {
        success: true,
        data: products,
        count: products.length,
      };
    } catch (error: any) {
      throw new Error(`Error fetching for you products: ${error.message}`);
    }
  }

  // Popular: Sản phẩm được yêu thích nhiều nhất
  async getPopularProducts(limit: number = 4) {
    try {
      const products = await Product.find()
        .populate("brand_id")
        .select("name base_price images brand_id discount")
        .sort({ favorites: -1, sold: -1 })
        .limit(limit);

      return {
        success: true,
        data: products,
        count: products.length,
      };
    } catch (error: any) {
      throw new Error(`Error fetching popular products: ${error.message}`);
    }
  }

  // Newest: Sản phẩm mới nhất
  async getNewestProducts(limit: number = 4) {
    try {
      const products = await Product.find()
        .populate("brand_id")
        .select("name base_price images brand_id discount")
        .sort({ createdAt: -1 })
        .limit(limit);

      return {
        success: true,
        data: products,
        count: products.length,
      };
    } catch (error: any) {
      throw new Error(`Error fetching newest products: ${error.message}`);
    }
  }

  // Toggle Favorite: Thêm/xóa sản phẩm vào danh sách yêu thích
  async toggleFavorite(firebaseUid: string, productId: string) {
    try {
      const user = await User.findOne({ firebaseUid });
      const product = await Product.findById(productId);

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      if (!product) {
        return {
          success: false,
          message: "Product not found",
        };
      }

      // Kiểm tra xem đã yêu thích chưa
      const existingFavorite = await Favorite.findOne({
        user_id: user._id,
        product_id: productId,
      });

      if (existingFavorite) {
        // Xóa khỏi danh sách yêu thích
        await Favorite.deleteOne({ _id: existingFavorite._id });
        product.favorites = Math.max(0, product.favorites - 1);
        await product.save();

        return {
          success: true,
          message: "Removed from favorites",
          isFavorited: false,
        };
      } else {
        // Thêm vào danh sách yêu thích
        await Favorite.create({
          user_id: user._id,
          product_id: productId,
        });
        product.favorites += 1;
        await product.save();

        return {
          success: true,
          message: "Added to favorites",
          isFavorited: true,
        };
      }
    } catch (error: any) {
      throw new Error(`Error toggling favorite: ${error.message}`);
    }
  }

  // Get User Favorites: Lấy danh sách sản phẩm yêu thích của user
  async getUserFavorites(firebaseUid: string) {
    try {
      const user = await User.findOne({ firebaseUid });

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      const favorites = await Favorite.find({ user_id: user._id })
        .populate({
          path: "product_id",
          populate: {
            path: "brand_id",
            model: "Brand",
          },
        })
        .sort({ createdAt: -1 });

      const products = favorites.map((fav) => fav.product_id);

      return {
        success: true,
        data: products,
        count: products.length,
      };
    } catch (error: any) {
      throw new Error(`Error fetching user favorites: ${error.message}`);
    }
  }

  async searchProducts(query: any = {}) {
    const q = String(query.q || "").trim();
    const page = Math.max(1, parseInt(String(query.page || "1"), 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(String(query.limit || "20"), 10)),
    );
    const skip = (page - 1) * limit;

    if (!q) {
      return { success: true, data: [], count: 0, page, limit, total: 0 };
    }

    const filter = {
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    };

    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate("brand_id")
        .select("name base_price images brand_id discount createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    return {
      success: true,
      data: items,
      count: items.length,
      total,
      page,
      limit,
    };
  }
}

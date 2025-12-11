import { Product, Brand } from "../../models";
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
}

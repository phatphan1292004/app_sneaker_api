import { Product, Brand } from "../../models";

export class ProductService {
  async getAllProducts() {
    try {
      const products = await Product.find().populate('brand_id');
      
      return {
        success: true,
        data: products,
        count: products.length,
      };
    } catch (error: any) {
      console.error("Error in getAllProducts:", error);
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  async getProductById(id: string) {
    try {
      const product = await Product.findById(id).populate('brand_id');

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
      const products = await Product.find({ brand_id: brandId }).populate('brand_id');
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
        .populate('brand_id')
        .select('name base_price images brand_id')
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
        .populate('brand_id')
        .select('name base_price images image brand_id')
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
        .populate('brand_id')
        .select('name base_price images image brand_id')
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

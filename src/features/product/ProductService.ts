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

  async getProductsByCategory(category: string) {
    try {
      const products = await Product.find({ category }).populate('brand_id');

      return {
        success: true,
        data: products,
        count: products.length,
      };
    } catch (error: any) {
      throw new Error(`Error fetching products by category: ${error.message}`);
    }
  }
}

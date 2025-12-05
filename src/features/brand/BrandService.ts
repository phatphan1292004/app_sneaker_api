import { Brand } from "../../models";

export class BrandService {
  async getAllBrands() {
    try {
      const brands = await Brand.find();
      console.log("Brands found:", brands.length);
      return {
        success: true,
        data: brands,
        count: brands.length,
      };
    } catch (error: any) {
      console.error("Error in getAllBrands:", error);
      throw new Error(`Error fetching brands: ${error.message}`);
    }
  }

  async getBrandById(id: string) {
    try {
      const brand = await Brand.findById(id);

      if (!brand) {
        return {
          success: false,
          message: "Brand not found",
        };
      }

      return {
        success: true,
        data: brand,
      };
    } catch (error: any) {
      throw new Error(`Error fetching brand: ${error.message}`);
    }
  }

  async getBrandBySlug(slug: string) {
    try {
      const brand = await Brand.findOne({ slug });

      if (!brand) {
        return {
          success: false,
          message: "Brand not found",
        };
      }

      return {
        success: true,
        data: brand,
      };
    } catch (error: any) {
      throw new Error(`Error fetching brand: ${error.message}`);
    }
  }
}

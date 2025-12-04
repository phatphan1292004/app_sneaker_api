import { AppDataSource } from '../../database';
import { Brand } from '../../entities';

export class BrandService {
  private brandRepository = AppDataSource.getMongoRepository(Brand);

  async getAllBrands() {
    try {
      const brands = await this.brandRepository.find();
      return {
        success: true,
        data: brands,
        count: brands.length,
      };
    } catch (error: any) {
      throw new Error(`Error fetching brands: ${error.message}`);
    }
  }

  async getBrandById(id: string) {
    try {
      const brand = await this.brandRepository.findOne({
        where: { _id: id } as any,
      });

      if (!brand) {
        return {
          success: false,
          message: 'Brand not found',
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
      const brand = await this.brandRepository.findOne({
        where: { slug } as any,
      });

      if (!brand) {
        return {
          success: false,
          message: 'Brand not found',
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

  async createBrand(brandData: Partial<Brand>) {
    try {
      const brand = this.brandRepository.create(brandData);
      const savedBrand = await this.brandRepository.save(brand);

      return {
        success: true,
        data: savedBrand,
        message: 'Brand created successfully',
      };
    } catch (error: any) {
      throw new Error(`Error creating brand: ${error.message}`);
    }
  }

  async updateBrand(id: string, brandData: Partial<Brand>) {
    try {
      const brand = await this.brandRepository.findOne({
        where: { _id: id } as any,
      });

      if (!brand) {
        return {
          success: false,
          message: 'Brand not found',
        };
      }

      await this.brandRepository.update(id, brandData);
      const updatedBrand = await this.brandRepository.findOne({
        where: { _id: id } as any,
      });

      return {
        success: true,
        data: updatedBrand,
        message: 'Brand updated successfully',
      };
    } catch (error: any) {
      throw new Error(`Error updating brand: ${error.message}`);
    }
  }

  async deleteBrand(id: string) {
    try {
      const brand = await this.brandRepository.findOne({
        where: { _id: id } as any,
      });

      if (!brand) {
        return {
          success: false,
          message: 'Brand not found',
        };
      }

      await this.brandRepository.delete(id);

      return {
        success: true,
        message: 'Brand deleted successfully',
      };
    } catch (error: any) {
      throw new Error(`Error deleting brand: ${error.message}`);
    }
  }
}

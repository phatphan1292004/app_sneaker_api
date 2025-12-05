import { Router, Request, Response } from 'express';
import { BrandService } from './BrandService';

const router = Router();
const brandService = new BrandService();

// GET all brands
router.get('/api/brand', async (_req: Request, res: Response) => {
  try {
    const result = await brandService.getAllBrands();
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET brand by slug
router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const result = await brandService.getBrandBySlug(req.params.slug);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

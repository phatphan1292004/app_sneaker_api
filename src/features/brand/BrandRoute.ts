import { Router, Request, Response } from 'express';
import { BrandService } from './BrandService';

const router = Router();
const brandService = new BrandService();

// GET all brands
router.get('/brand', async (_req: Request, res: Response) => {
  try {
    const result = await brandService.getAllBrands();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET brand by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await brandService.getBrandById(req.params.id);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
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
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST create new brand
router.post('/', async (req: Request, res: Response) => {
  try {
    const result = await brandService.createBrand(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT update brand
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const result = await brandService.updateBrand(req.params.id, req.body);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE brand
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await brandService.deleteBrand(req.params.id);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

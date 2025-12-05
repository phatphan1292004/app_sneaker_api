import { Router, Request, Response } from 'express';
import { ProductService } from './ProductService';

const router = Router();
const productService = new ProductService();

// GET all products
router.get('/api/product', async (_req: Request, res: Response) => {
  try {
    const result = await productService.getAllProducts();
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET product by id
router.get('/api/product/:id', async (req: Request, res: Response) => {
  try {
    const result = await productService.getProductById(req.params.id);
    
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

// GET products by brand
router.get('/product/brand/:brandId', async (req: Request, res: Response) => {
  try {
    const result = await productService.getProductsByBrand(req.params.brandId);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET For You products (4 sản phẩm có views cao nhất)
router.get('/product/foryou', async (_req: Request, res: Response) => {
  try {
    const result = await productService.getForYouProducts(4);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET Popular products (4 sản phẩm được yêu thích nhất)
router.get('/product/popular', async (_req: Request, res: Response) => {
  try {
    const result = await productService.getPopularProducts(4);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET Newest products (4 sản phẩm mới nhất)
router.get('/product/newest', async (_req: Request, res: Response) => {
  try {
    const result = await productService.getNewestProducts(4);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

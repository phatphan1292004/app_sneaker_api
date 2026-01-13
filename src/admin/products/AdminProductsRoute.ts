import { Router, Request, Response } from "express";
import { AdminProductsService } from "./AdminProductsService";

const router = Router();
const service = new AdminProductsService();

/**
 * Base: /admin/products
 */
router.get("/admin/products", async (req: Request, res: Response) => {
  try {
    const result = await service.listProducts({
      q: String(req.query.q || ""),
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 50),
      sort: String(req.query.sort || "-createdAt"),
    });
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.post("/admin/products", async (req: Request, res: Response) => {
  try {
    const result = await service.createProduct(req.body);
    if (!result.success) return res.status(409).json(result);
    return res.status(201).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/admin/products/:id", async (req: Request, res: Response) => {
  try {
    const result = await service.getProductById(req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.patch("/admin/products/:id", async (req: Request, res: Response) => {
  try {
    const result = await service.updateProduct(req.params.id, req.body);
    if (!result.success) return res.status(409).json(result);
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.delete("/admin/products/:id", async (req: Request, res: Response) => {
  try {
    const result = await service.deleteProduct(req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// nested variants
router.get(
  "/admin/products/:id/variants",
  async (req: Request, res: Response) => {
    try {
      const result = await service.listVariants(req.params.id);
      if (!result.success) return res.status(404).json(result);
      return res.status(200).json(result);
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }
);

router.post(
  "/admin/products/:id/variants",
  async (req: Request, res: Response) => {
    try {
      const result = await service.createVariant(req.params.id, req.body);
      if (!result.success) return res.status(409).json(result);
      return res.status(201).json(result);
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }
);

export default router;

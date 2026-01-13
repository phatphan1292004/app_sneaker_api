import { Router, Request, Response } from "express";
import { AdminProductsService } from "./AdminProductsService";

const router = Router();
const service = new AdminProductsService();

/**
 * Base: /admin/variants
 */
router.patch("/admin/variants/:id", async (req: Request, res: Response) => {
  try {
    const result = await service.updateVariant(req.params.id, req.body);
    if (!result.success) return res.status(409).json(result);
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.delete("/admin/variants/:id", async (req: Request, res: Response) => {
  try {
    const result = await service.deleteVariant(req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

export default router;

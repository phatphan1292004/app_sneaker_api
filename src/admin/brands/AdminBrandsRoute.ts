import { Router, Request, Response } from "express";
import { AdminBrandsService } from "./AdminBrandsService";

const router = Router();
const service = new AdminBrandsService();

/**
 * Base: /admin/brands
 * - GET    /admin/brands?q=&page=&limit=&sort=
 * - POST   /admin/brands
 * - GET    /admin/brands/:id
 * - PATCH  /admin/brands/:id
 * - DELETE /admin/brands/:id
 */

router.get("/admin/brands", async (req: Request, res: Response) => {
  try {
    const result = await service.listBrands({
      q: String(req.query.q || ""),
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 30),
      sort: String(req.query.sort || "-createdAt"),
    });
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.post("/admin/brands", async (req: Request, res: Response) => {
  try {
    const result = await service.createBrand(req.body);
    if (!result.success) {
      const status = result.field ? 409 : 400;
      return res.status(status).json(result);
    }
    return res.status(201).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/admin/brands/:id", async (req: Request, res: Response) => {
  try {
    const result = await service.getBrandById(req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.patch("/admin/brands/:id", async (req: Request, res: Response) => {
  try {
    const result = await service.updateBrand(req.params.id, req.body);
    if (!result.success) {
      const status = result.message?.includes("Invalid brand id")
        ? 400
        : result.message?.includes("not found")
        ? 404
        : result.field
        ? 409
        : 400;
      return res.status(status).json(result);
    }
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.delete("/admin/brands/:id", async (req: Request, res: Response) => {
  try {
    const result = await service.deleteBrand(req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

export default router;

import { Router, Request, Response } from "express";
import { AdminOrdersService } from "./AdminOrdersService";

const router = Router();
const service = new AdminOrdersService();

/**
 * Base: /admin/orders
 * - GET    /admin/orders?q=&status=&page=&limit=&sort=
 * - GET    /admin/orders/:id
 * - PATCH  /admin/orders/:id
 * - DELETE /admin/orders/:id
 */

router.get("/admin/orders", async (req: Request, res: Response) => {
  try {
    const result = await service.listOrders({
      q: String(req.query.q || ""),
      status: String(req.query.status || "all"),
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 30),
      sort: String(req.query.sort || "-createdAt"),
    });

    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/admin/orders/:id", async (req: Request, res: Response) => {
  try {
    const result = await service.getOrderById(req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.patch("/admin/orders/:id", async (req: Request, res: Response) => {
  try {
    const result = await service.updateOrder(req.params.id, req.body);
    if (!result.success) return res.status(409).json(result);
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.delete("/admin/orders/:id", async (req: Request, res: Response) => {
  try {
    const result = await service.deleteOrder(req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// GET /admin/orders/:id
router.get("/admin/orders/:id", async (req: Request, res: Response) => {
  try {
    const r = await service.getOrderById(req.params.id);
    if (!r.success) return res.status(404).json(r);
    return res.status(200).json(r);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /admin/orders/:id/status
router.patch(
  "/admin/orders/:id/status",
  async (req: Request, res: Response) => {
    try {
      const r = await service.updateStatus(req.params.id, req.body?.status);
      if (!r.success) return res.status(409).json(r);
      return res.status(200).json(r);
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }
);

export default router;

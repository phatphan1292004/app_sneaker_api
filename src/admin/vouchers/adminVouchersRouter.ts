import { Router, Request, Response } from "express";
import { AdminVouchersService } from "./AdminVouchersService";

const router = Router();
const service = new AdminVouchersService();

/**
 * Base: /admin/vouchers
 * - GET    /admin/vouchers?q=&status=all|active|expired&page=&limit=&sort=
 * - GET    /admin/vouchers/:id
 * - POST   /admin/vouchers
 * - PATCH  /admin/vouchers/:id
 * - DELETE /admin/vouchers/:id
 */

router.get("/admin/vouchers", async (req: Request, res: Response) => {
  try {
    const r = await service.listVouchers({
      q: String(req.query.q || ""),
      status: String(req.query.status || "all"),
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 30),
      sort: String(req.query.sort || "-createdAt"),
    });
    if (!r.success) return res.status(400).json(r);
    return res.status(200).json(r);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/admin/vouchers/:id", async (req: Request, res: Response) => {
  try {
    const r = await service.getVoucherById(req.params.id);
    if (!r.success) return res.status(404).json(r);
    return res.status(200).json(r);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.post("/admin/vouchers", async (req: Request, res: Response) => {
  try {
    const r = await service.createVoucher(req.body);
    if (!r.success) return res.status(409).json(r);
    return res.status(201).json(r);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.patch("/admin/vouchers/:id", async (req: Request, res: Response) => {
  try {
    const r = await service.updateVoucher(req.params.id, req.body);
    if (!r.success) return res.status(409).json(r);
    return res.status(200).json(r);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.delete("/admin/vouchers/:id", async (req: Request, res: Response) => {
  try {
    const r = await service.deleteVoucher(req.params.id);
    if (!r.success) return res.status(404).json(r);
    return res.status(200).json(r);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

export default router;

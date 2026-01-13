import { Router, Request, Response } from "express";
import { AdminDashboardService } from "./AdminDashboardService";

const router = Router();
const service = new AdminDashboardService();

/**
 * GET /admin/dashboard
 * query:
 *   - days: số ngày chart (default 7)
 */
router.get("/admin/dashboard", async (req: Request, res: Response) => {
  try {
    const days = Math.max(1, Math.min(30, Number(req.query.days || 7)));
    const r = await service.getDashboard({ days });
    return res.status(200).json(r);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

export default router;

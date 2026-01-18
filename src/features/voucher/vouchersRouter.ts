import { Router, Request, Response } from "express";
import { VouchersService } from "./VouchersService";

const router = Router();
const service = new VouchersService();

/**
 * POST /vouchers/apply
 * body: { code: string, subtotal: number }
 */
router.post("/vouchers/apply", async (req: Request, res: Response) => {
  try {
    const r = await service.applyVoucher({
      code: req.body?.code,
      subtotal: req.body?.subtotal,
    });

    if (!r.success) return res.status(400).json(r);
    return res.status(200).json(r);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

export default router;

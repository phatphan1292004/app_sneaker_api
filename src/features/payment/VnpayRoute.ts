import { Router, Request, Response } from "express";
import { VnpayService } from "./VnpayService";

const router = Router();

// POST tạo URL VNPay
router.post("/api/vnpay", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    if (!orderId)
      return res
        .status(400)
        .json({ success: false, message: "orderId is required" });

    const ipAddr =
      req.headers["x-forwarded-for"]?.toString()?.split(",")[0] || "127.0.0.1";
    const url = await VnpayService.createPaymentUrl(orderId, ipAddr);

    return res.json({ success: true, url });
  } catch (error: any) {
    console.error("VNPAY create URL error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET callback VNPay
router.get("/api/vnpay-return", async (req: Request, res: Response) => {
  try {
    console.log("VNPay callback query:", req.query);
    const result = await VnpayService.handleReturn(req.query);
    return res.json(result);
  } catch (error: any) {
    console.error("VNPAY callback error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export { router as VnpayRoute };

import { Router, Request, Response } from "express";
import { OrderService } from "./OrderService";

const router = Router();
const orderService = new OrderService();

// Tạo order mới
router.post("/order", async (req: Request, res: Response) => {
  try {
    const result = await orderService.createOrder(req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Lấy danh sách orders của user
router.get("/order/user/:userId", async (req: Request, res: Response) => {
  try {
    const result = await orderService.getUserOrders(req.params.userId);

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

// Lấy chi tiết order theo orderId
router.get("/order/:orderId", async (req: Request, res: Response) => {
  try {
    const result = await orderService.getOrderById(req.params.orderId);
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

// Hủy đơn (pending -> cancelled) + hoàn kho
router.post("/order/:orderId/cancel", async (req: Request, res: Response) => {
  try {
    const result = await orderService.cancelOrder(req.params.orderId);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Mua lại: trả payload để client đổ lại giỏ hàng (không tạo order mới)
router.post("/order/:orderId/reorder", async (req: Request, res: Response) => {
  try {
    const result = await orderService.reorderFromOrder(req.params.orderId);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result); // 200 vì chỉ trả payload
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Cập nhật địa chỉ giao hàng
router.put("/order/:orderId/shipping-address", async (req: Request, res: Response) => {
  try {
    const result = await orderService.updateShippingAddress(req.params.orderId, req.body);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

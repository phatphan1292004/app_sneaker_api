import { Router, Request, Response } from 'express';
import { OrderService } from './OrderService';

const router = Router();
const orderService = new OrderService();

// Tạo order mới
router.post('/order', async (req: Request, res: Response) => {
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
router.get('/order/user/:userId', async (req: Request, res: Response) => {
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
router.get('/order/:orderId', async (req: Request, res: Response) => {
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

export default router;

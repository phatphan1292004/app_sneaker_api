import { Router, Request, Response } from 'express';
import { AddressService } from './AddressService';

const router = Router();
const addressService = new AddressService();

// Thêm địa chỉ mới
router.post('/address', async (req: Request, res: Response) => {
  try {
    const { user_id, type, street, province, district, ward, isDefault } = req.body;
    if (!user_id || !type || !street || !province || !district || !ward) {
      return res.status(400).json({
        success: false,
        message: 'Missing required address fields',
      });
    }
    const result = await addressService.addAddress({ user_id, type, street, province, district, ward, isDefault });
    if (!result.success) {
      return res.status(500).json(result);
    }
    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


// Lấy danh sách địa chỉ theo user_id
router.get('/address/user/:user_id', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const result = await addressService.getAddressesByUserId(user_id);
    if (!result.success) {
      return res.status(500).json(result);
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

import { Router, Request, Response } from "express";
import { AddressService } from "./AddressService";

const router = Router();
const addressService = new AddressService();

/**
 * ADD ADDRESS
 */
router.post("/address", async (req: Request, res: Response) => {
  try {
    const { user_id, type, street, province, district, ward, isDefault } =
      req.body;

    if (!user_id || !type || !street || !province || !district || !ward) {
      return res.status(400).json({
        success: false,
        message: "Missing required address fields",
      });
    }

    const result = await addressService.addAddress({
      user_id,
      type,
      street,
      province,
      district,
      ward,
      isDefault,
    });

    return res.status(result.success ? 201 : 500).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET ADDRESS BY USER
 */
router.get("/address/user/:user_id", async (req: Request, res: Response) => {
  try {
    const result = await addressService.getAddressesByUserId(
      req.params.user_id
    );

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * SET DEFAULT ADDRESS
 */
router.put("/address/:id/set-default", async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "Missing user_id",
      });
    }

    const result = await addressService.setDefaultAddress(
      user_id,
      req.params.id
    );

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 🔹 Xóa địa chỉ
router.delete("/address/:id", async (req: Request, res: Response) => {
  try {
    const result = await addressService.deleteAddress(req.params.id);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

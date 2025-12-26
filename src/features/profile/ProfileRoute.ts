import { Router, Request, Response } from "express";
import { ProfileService } from "./ProfileService";

const router = Router();
const profileService = new ProfileService();

/**
 * GET profile by firebaseUid
 * FE gọi khi mở Edit Profile
 */
router.get(
  "/profile/by-firebase/:firebaseUid",
  async (req: Request, res: Response) => {
    try {
      const result = await profileService.getByFirebaseUid(
        req.params.firebaseUid
      );

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

/**
 * UPDATE profile by Mongo _id
 */
router.put("/profile/:id", async (req: Request, res: Response) => {
  try {
    const result = await profileService.updateProfile(req.params.id, req.body);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.put("/profile/:id/avatar", async (req: Request, res: Response) => {
  try {
    const { avatar } = req.body;

    const result = await profileService.updateAvatar(req.params.id, avatar);

    if (!result.success) return res.status(404).json(result);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

import { Router, Request, Response } from "express";
import { NotificationService } from "./NotificationService";

const router = Router();
const notificationService = new NotificationService();

// GET all notifications
router.get(
  "/notifications/:firebaseUid",
  async (req: Request, res: Response) => {
    try {
      const result = await notificationService.getAll(req.params.firebaseUid);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// COUNT unread notifications
router.get(
  "/notifications/:firebaseUid/unread-count",
  async (req: Request, res: Response) => {
    try {
      const result = await notificationService.countUnread(
        req.params.firebaseUid
      );
      res.json(result);
    } catch (error: any) {
      res.status(404).json({
        success: false,
        count: 0,
        message: error.message,
      });
    }
  }
);

// MARK AS READ
router.put("/notifications/:id/read", async (req: Request, res: Response) => {
  try {
    const result = await notificationService.markAsRead(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE notification
router.delete("/notifications/:id", async (req: Request, res: Response) => {
  try {
    const result = await notificationService.remove(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;

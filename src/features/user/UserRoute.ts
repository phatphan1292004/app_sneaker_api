import { Router, Request, Response } from 'express';
import { UserService } from './UserService';

const router = Router();
const userService = new UserService();

// POST create new user
router.post('/user', async (req: Request, res: Response) => {
  try {
    const { firebaseUid, username, email, avatar, phoneNumber } = req.body;

    // Validate required fields
    if (!firebaseUid || !username || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: firebaseUid, username, email",
      });
    }

    const result = await userService.createUser({
      firebaseUid,
      username,
      email,
      avatar,
      phoneNumber,
    });

    if (!result.success) {
      return res.status(409).json(result); 
    }

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


// GET user by ID
router.get('/user/:id', async (req: Request, res: Response) => {
  try {
    const result = await userService.getUserById(req.params.id);

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

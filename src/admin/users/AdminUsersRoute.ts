import { Router, Request, Response } from "express";
import { AdminUsersService } from "./AdminUsersService";

const router = Router();
const service = new AdminUsersService();

/**
 * Base: /admin/users
 * - GET    /admin/users?q=&page=&limit=&sort=
 * - POST   /admin/users
 * - GET    /admin/users/:id
 * - PATCH  /admin/users/:id
 * - DELETE /admin/users/:id
 */

router.get("/admin/users", async (req: Request, res: Response) => {
  try {
    const result = await service.listUsers({
      q: String(req.query.q || ""),
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 50),
      sort: String(req.query.sort || "-createdAt"),
    });
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.post("/admin/users", async (req: Request, res: Response) => {
  try {
    const result = await service.createUser(req.body);
    if (!result.success) return res.status(409).json(result);
    return res.status(201).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/admin/users/:id", async (req: Request, res: Response) => {
  try {
    const result = await service.getUserById(req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.patch("/admin/users/:id", async (req: Request, res: Response) => {
  try {
    const result = await service.updateUser(req.params.id, req.body);
    if (!result.success) return res.status(409).json(result);
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.delete("/admin/users/:id", async (req: Request, res: Response) => {
  try {
    const result = await service.deleteUser(req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

export default router;

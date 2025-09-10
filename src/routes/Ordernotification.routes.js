import { Router } from "express";
import {
  getAdminNotifications,
  markNotificationRead,
} from "../controllers/orderNotification.controler.js";

const router = Router();

router.get("/:adminId", getAdminNotifications);
router.post("/markRead", markNotificationRead);

export default router;

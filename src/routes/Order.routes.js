import { Router } from "express";
import {
  getAllOrders,
  getOrderById,
  getTotalPayments,
  placeOrder,
  updateOrderStatus,
} from "../controllers/Order.controler.js";

const router = Router();

router.route("/add").post(placeOrder);
router.route("/allorder").get(getAllOrders);
router.route("/total-payments").get(getTotalPayments);
router.route("/singleorder/:id").get(getOrderById);
router.route("/updateorder").patch(updateOrderStatus);

export default router;

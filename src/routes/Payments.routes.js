import { Router } from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentDetails,
  verifyPayment,
} from "../controllers/Paymets.controler.js";
import { failedpage, initiatePayment, successpage } from "../controllers/Paymoneypayments.controler.js";

const router = Router();

router.post("/create", createPayment);
router.post("/create_payments", initiatePayment);
router.post("/success", successpage);
router.post("/failed", failedpage);
router.post("/verify", verifyPayment);
router.get("/:paymentId", getPaymentDetails);
router.get("/", getAllPayments);
export default router;

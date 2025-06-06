import { Router } from "express";
import { createInquiry, deleteInquiryById, getAllInquiries } from "../controllers/Inquiry.controler.js";


const router = Router();

router.route("/create").post(createInquiry);
router.route("/").get(getAllInquiries);
router.route("/delete").delete(deleteInquiryById);


export default router;
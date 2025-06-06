import { Router } from "express";
import { addFAQ, getAllFAQs } from "../controllers/Faqs.controler.js";

const router = Router();

router.route("/add").post(addFAQ);
router.route("/all").get(getAllFAQs);

export default router;
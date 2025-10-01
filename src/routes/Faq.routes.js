import { Router } from "express";
import { addFAQ, deleteFAQ, getAllFAQs } from "../controllers/Faqs.controler.js";

const router = Router();

router.route("/add").post(addFAQ);
router.route("/all").get(getAllFAQs);
router.route("/delete/:id").delete(deleteFAQ);

export default router;
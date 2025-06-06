import { Router } from "express";
import { addPrivacyPolicy, getAllPrivacyPolicies } from "../controllers/Privacypolicy.controler.js";


const router = Router();
router.route("/add").post(addPrivacyPolicy);
router.route("/").get(getAllPrivacyPolicies);

export default router;

import { Router } from "express";
import {
  changeAdminPassword,
  forgotPassword,
  getAdminDetails,
  loginAdmin,
  logoutAdmin,
  resetPassword,
  updateAdmin,
  verifyPassword,
} from "../controllers/Admin.controler.js";

import { adminVerifyJWT } from "../middlewares/adminVerifyJWT.js";

const router = Router();

router.route("/login").post(loginAdmin);
router.route("/verifyPassword").post(verifyPassword);
router.route("/logout").post(logoutAdmin);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword").patch(resetPassword);
router.route("/Profile").get(getAdminDetails);
router.route("/update").patch(updateAdmin);
router.route("/change-password").post(adminVerifyJWT, changeAdminPassword);

export default router;

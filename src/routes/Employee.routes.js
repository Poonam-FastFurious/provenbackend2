import { Router } from "express";
import { upload } from "../middlewares/FileUpload.middlwares.js";
import {
  CreateEmployee, UpdateEmployee,
  deleteEmployee, getAllEmployees, getEmployee,
  loginEmployee
} from "../controllers/Employee.controler.js";

const router = Router();

router.route("/create").post(
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  CreateEmployee
);
router.route("/update").patch(UpdateEmployee);
router.route("/delete").delete(deleteEmployee);
router.route("/allEmployees").get(getAllEmployees);
router.route("/Employee").get(getEmployee);
router.route("/login").post(loginEmployee);
export default router;

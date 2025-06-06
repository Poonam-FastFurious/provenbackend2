import { Router } from "express";
import { upload } from "../middlewares/FileUpload.middlwares.js";
import {
    CreateNotification,
    UpdateNotification,
    deleteNotification,
    getAllNotification,
    getNotification
} from "../controllers/Notification.controler.js";

const router = Router();

router.route("/send").post(CreateNotification);
router.route("/update").patch(UpdateNotification);
router.route("/delete").delete(deleteNotification);
router.route("/allnotification").get(getAllNotification);
router.route("/notification").get(getNotification);
export default router;

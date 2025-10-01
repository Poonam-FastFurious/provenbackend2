import { Router } from "express";
import { upload } from "../middlewares/FileUpload.middlwares.js";
import {
  addReview,
  getAllReviews,
  getReviewsByProductId,
} from "../controllers/Review.controler.js";

const router = Router();

router.route("/add").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  addReview
);

router.route("/").get(getAllReviews);
router.route("/product").get(getReviewsByProductId);

export default router;

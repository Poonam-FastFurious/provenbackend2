import { Router } from "express";
import {
  createLocation,
  deleteLocation,
  getAllLocations,
} from "../controllers/Storelocation.controler.js";

const router = Router();
router.route("/add").post(createLocation);
router.route("/").get(getAllLocations);
router.route("/delete").delete(deleteLocation);

export default router;

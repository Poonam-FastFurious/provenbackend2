import express from "express";
import { getDashboardData } from "./Dashboard.controler.js";

const router = express.Router();

router.get("/", getDashboardData);

export default router;

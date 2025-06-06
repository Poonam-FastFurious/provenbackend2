import express from "express";
import { getSearchData } from "../controllers/Search.controler.js";

const router = express.Router();

// Route to get search data
router.get("/search-data", getSearchData);

export default router;

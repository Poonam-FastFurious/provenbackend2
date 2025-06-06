import { SearchData } from "../models/Search.modal.js";

export const getSearchData = async (req, res) => {
  try {
    // Fetch search data with optional query parameters
    const { searchParam } = req.query;

    // Build query object
    const query = searchParam
      ? { searchParam: { $regex: searchParam, $options: "i" } }
      : {};

    // Fetch records from database
    const searchData = await SearchData.find(query).sort({ createdAt: -1 });

    if (searchData.length === 0) {
      return res.status(404).json({ message: "No search data found" });
    }

    res.status(200).json({ success: true, data: searchData });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

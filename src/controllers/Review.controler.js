import { Review } from "../models/Productreview.modal.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

// Controller function to add a new review
const addReview = asyncHandler(async (req, res) => {
  try {
    if (!req.body) {
      throw new ApiError(400, "Request body is missing or empty");
    }

    const { productName, name, email, rating, message } = req.body;

    if (
      ![productName, name, email, rating, message].every((field) =>
        field?.trim()
      )
    ) {
      throw new ApiError(
        400,
        "Product name, name, email, rating, and message are required"
      );
    }

    // Check for existing review by the same user for the same product (optional)
    const existingReview = await Review.findOne({ productName, email });
    if (existingReview) {
      throw new ApiError(409, "You have already reviewed this product");
    }

    // Handle avatar image upload
    let avatarUrl = "";
    if (req.files && req.files.avatar) {
      const avatarLocalPath = req.files.avatar[0].path;
      const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
      avatarUrl = uploadedAvatar.url;
    }

    // Create and save the new review
    const review = new Review({
      productName,
      name,
      avatar: avatarUrl,
      email,
      rating,
      message,
    });
    await review.save();

    return res
      .status(201)
      .json(new ApiResponse(201, review, "Review added successfully"));
  } catch (error) {
    console.error("Error during adding review:", error);

    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
const getAllReviews = asyncHandler(async (req, res) => {
  try {
    const reviews = await Review.find().populate("productName", "name"); // Adjust 'name' to match the field in your Product model

    if (!reviews) {
      throw new ApiError(404, "No reviews found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, reviews, "Reviews retrieved successfully"));
  } catch (error) {
    console.error("Error retrieving reviews:", error);

    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
const getReviewsByProductId = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.query;

    if (!productId) {
      throw new ApiError(400, "Product ID is required");
    }

    const reviews = await Review.find({ productName: productId }).populate(
      "productName",
      "name"
    ); // Adjust 'name' as needed

    if (!reviews || reviews.length === 0) {
      throw new ApiError(404, "No reviews found for this product");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, reviews, "Reviews retrieved successfully"));
  } catch (error) {
    console.error("Error retrieving reviews by product ID:", error);

    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export { addReview, getAllReviews, getReviewsByProductId };

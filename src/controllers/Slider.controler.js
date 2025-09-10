import { Slider } from "../models/Slider.modal.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { uploadOnCloudinary } from "../utils/Cloudinary.js";

export const addSlider = asyncHandler(async (req, res) => {
  try {
    if (!req.body) {
      throw new ApiError(400, "Request body is missing or empty");
    }

    const { title, details, link } = req.body;

    if (![title, details, link].every((field) => field?.trim())) {
      throw new ApiError("All fields are required");
    }

    const imageLocalPath = req.files?.sliderImage[0]?.path;
    if (!imageLocalPath) {
      throw new Error("Slider image file is required");
    }

    const uploadedImage = await uploadOnCloudinary(imageLocalPath);
    if (!uploadedImage) {
      throw new Error("Failed to upload slider image");
    }

    const slider = await Slider.create({
      sliderImage: uploadedImage.url,
      title,
      details,
      link,
    });

    return res.status(201).json({
      success: true,
      data: slider,
      message: "Slider added successfully",
    });
  } catch (error) {
    console.error("Error during slider addition:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export const getAllSliders = asyncHandler(async (req, res) => {
  try {
    const sliders = await Slider.find();
    return res.status(200).json({
      success: true,
      data: sliders,
    });
  } catch (error) {
    console.error("Error fetching sliders:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export const updateSlider = asyncHandler(async (req, res) => {
  try {
    const { id, title, details, link } = req.body;

    // Check if the slider exists
    const slider = await Slider.findById(id);
    if (!slider) {
      throw new ApiError(404, "Slider not found");
    }

    // Update slider fields
    slider.title = title;
    slider.details = details;
    slider.link = link;

    // Handle slider image update if provided
    if (
      req.files &&
      req.files.sliderImage &&
      req.files.sliderImage.length > 0
    ) {
      const imageLocalPath = req.files.sliderImage[0].path;
      const uploadedImage = await uploadOnCloudinary(imageLocalPath);

      if (!uploadedImage) {
        throw new ApiError(500, "Failed to upload slider image");
      }

      slider.sliderImage = uploadedImage.url;
    }

    // Save the updated slider
    await slider.save();

    return res.status(200).json({
      success: true,
      data: slider,
      message: "Slider updated successfully",
    });
  } catch (error) {
    console.error("Error updating slider:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

// Function to delete a slider
export const deleteSlider = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body; // Assuming id is passed as a query parameter

    // Find the banner by id and delete it
    const deletedBanner = await Slider.findByIdAndDelete(id);

    if (!deletedBanner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });
    }

    return res.json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Error during banner deletion:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});
export const getSliderById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ApiError(400, "Slider ID is required");
    }

    const slider = await Slider.findById(id);
    if (!slider) {
      throw new ApiError(404, "Slider not found");
    }

    return res.status(200).json({
      success: true,
      data: slider,
      message: "Slider details retrieved successfully",
    });
  } catch (error) {
    console.error("Error retrieving slider details:", error);

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

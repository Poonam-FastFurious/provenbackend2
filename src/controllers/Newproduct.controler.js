import { Product } from "../models/NewProduct.modal.js";
import { Category } from "../models/Category.model.js"; // Import Category model
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { SearchData } from "../models/Search.modal.js";
const addProduct = asyncHandler(async (req, res) => {
  try {
    if (!req.body || !req.files) {
      throw new ApiError(400, "Request body or files are missing");
    }

    const {
      title,
      description,
      price,
      discount,
      cutPrice,
      categories,
      tags,
      sku,
      shortDescription,
      stocks,
      youtubeVideoLink,
      flipkarturl,
      amazonurl,
      
    } = req.body;

    // Validate required fields
    if (
      ![
        title,
        description,
        price,
        stocks,
        sku,
        categories,
        flipkarturl,
        amazonurl,
      ].every((field) => field && field.trim())
    ) {
      throw new ApiError(400, "All required fields must be filled");
    }

    // Ensure stocks and price are numbers
    const parsedStocks = parseInt(stocks, 10);
    const parsedPrice = parseFloat(price);

    if (isNaN(parsedStocks) || isNaN(parsedPrice)) {
      throw new ApiError(400, "Stocks and price must be valid numbers");
    }

    // Validate SKU format (example: SKU must be alphanumeric)
    const skuRegex = /^[A-Za-z0-9-]+$/;
    if (!skuRegex.test(sku)) {
      throw new ApiError(
        400,
        "SKU must be alphanumeric and follow the required format"
      );
    }

    // Validate YouTube video URL (basic validation)
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    if (youtubeVideoLink && !youtubeRegex.test(youtubeVideoLink)) {
      throw new ApiError(400, "Invalid YouTube video URL");
    }

    // Check for existing product by SKU
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      throw new ApiError(409, "Product with the same SKU already exists");
    }

    // Fetch existing category from the database
    const existingCategory = await Category.findOne({
      categoriesTitle: categories,
      status: "active",
    });

    if (!existingCategory) {
      throw new ApiError(400, `Invalid category: ${categories}`);
    }

    // Handle image and thumbnail upload
    const imageLocalPath = req.files?.image?.[0]?.path;
    const thumbnailFiles = req.files?.thumbnail;
    const bannerFiles = req.files?.banners; // Handle banner files
    if (!imageLocalPath || !thumbnailFiles || thumbnailFiles.length === 0) {
      throw new ApiError(400, "Image and Thumbnail files are required");
    }

    const uploadedImage = await uploadOnCloudinary(imageLocalPath);
    const uploadedThumbnails = await Promise.all(
      thumbnailFiles.map((file) => uploadOnCloudinary(file.path))
    );
    const uploadedBanners = bannerFiles
      ? await Promise.all(
          bannerFiles.map((file) => uploadOnCloudinary(file.path))
        )
      : [];

    if (!uploadedImage || !uploadedThumbnails.length) {
      throw new ApiError(400, "Failed to upload image or thumbnails");
    }

    // Validate and handle tags
    const parsedTags = Array.isArray(tags) ? tags : [tags]; // Ensure tags is an array

    // Create a new product
    const newProduct = await Product.create({
      title,
      description,
      price: parsedPrice,
      discount,
      cutPrice,
      categories,
      tags: parsedTags,
      sku,
      shortDescription,
      image: uploadedImage.url,
      thumbnail: uploadedThumbnails.map((thumbnail) => thumbnail.url),
      stocks: parsedStocks,
      youtubeVideoLink,
      amazonurl,
      flipkarturl,
      banners: uploadedBanners.map((banner) => banner.url),
    });

    // Return successful response
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct.toObject(),
    });
  } catch (error) {
    console.error("Error during product creation:", error);

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

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    // Fetch all products
    const products = await Product.find();

    // Count the total number of products
    const totalProducts = await Product.countDocuments();

    // Send the response
    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
      total: totalProducts,
    });
  } catch (error) {
    console.error("Error retrieving products:", error);

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

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    // Check if the product ID is provided
    const { id } = req.query; // Get product ID from query parameters

    if (!id) {
      throw new ApiError(400, "Product ID is required");
    }

    // Attempt to find and delete the product
    const product = await Product.findByIdAndDelete(id);

    // Check if the product was found and deleted
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Return a success response
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error during product deletion:", error);

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
const getSingleProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.query; // Assuming the product ID is passed as a URL parameter

    // Validate ID presence
    if (!id) {
      throw new ApiError(400, "Product ID is required");
    }

    // Find the product by ID
    const product = await Product.findById(id);

    // Check if product was found
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Return the product details
    return res.status(200).json({
      success: true,
      product: product.toObject(), // Convert Mongoose document to plain object
    });
  } catch (error) {
    console.error("Error fetching product details:", error);

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
const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;
    const {
      title,
      description,
      price,
      discount,
      cutPrice,
      categories,
      tags,
      sku,
      shortDescription,
      stocks,
      youtubeVideoLink,
      amazonurl, // New field for Amazon URL
      flipkarturl,
    } = req.body;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Validate SKU if provided
    if (sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct && existingProduct._id.toString() !== id) {
        throw new ApiError(409, "Product with the same SKU already exists");
      }
    }

    // Validate category if provided
    if (categories) {
      const existingCategory = await Category.findOne({
        categoriesTitle: categories,
        status: "active",
      });
      if (!existingCategory) {
        throw new ApiError(400, `Invalid category: ${categories}`);
      }
    }

    // Handle image and thumbnail updates if files are provided
    if (req.files) {
      const { image, thumbnail, banners } = req.files;

      if (image) {
        const uploadedImage = await uploadOnCloudinary(image[0].path);
        if (!uploadedImage) {
          throw new ApiError(400, "Failed to upload image");
        }
        product.image = uploadedImage.url;
      }

      if (thumbnail) {
        const uploadedThumbnails = await Promise.all(
          thumbnail.map((file) => uploadOnCloudinary(file.path))
        );
        if (!uploadedThumbnails.length) {
          throw new ApiError(400, "Failed to upload thumbnails");
        }
        product.thumbnail = uploadedThumbnails.map(
          (thumbnail) => thumbnail.url
        );
      }
      if (banners) {
        const uploadedBanners = await Promise.all(
          banners.map((file) => uploadOnCloudinary(file.path))
        );
        if (!uploadedBanners.length) {
          throw new ApiError(400, "Failed to upload banners");
        }
        product.banners = uploadedBanners.map((banner) => banner.url);
      }
    }

    // Update product fields if they are provided
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (discount) product.discount = discount;
    if (cutPrice) product.cutPrice = cutPrice;
    if (categories) product.categories = categories;
    if (tags) product.tags = Array.isArray(tags) ? tags : [tags];
    if (sku) product.sku = sku;
    if (shortDescription) product.shortDescription = shortDescription;
    if (stocks) product.stocks = parseInt(stocks, 10);
    if (youtubeVideoLink) product.youtubeVideoLink = youtubeVideoLink;
    if (amazonurl) product.amazonurl = amazonurl;
    if (flipkarturl) product.flipkarturl = flipkarturl;
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: product.toObject(),
    });
  } catch (error) {
    console.error("Error during product update:", error);

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
const buildQuery = (params) => {
  const query = {};

  if (params.title) {
    query.title = { $regex: params.title, $options: "i" }; // Case-insensitive regex
  }
  if (params.description) {
    query.description = { $regex: params.description, $options: "i" };
  }
  if (params.price) {
    query.price = params.price;
  }
  if (params.cutPrice) {
    query.cutPrice = params.cutPrice;
  }
  if (params.categories) {
    query.categories = params.categories;
  }
  if (params.tags) {
    query.tags = params.tags;
  }
  if (params.discount) {
    query.discount = params.discount;
  }
  if (params.rating) {
    query.rating = params.rating;
  }
  if (params.stocks) {
    query.stocks = Number(params.stocks);
  }

  if (params.tags) {
    query.tags = params.tags;
  }
  if (params.sku) {
    query.sku = params.sku;
  }
  if (params.shortDescription) {
    query.shortDescription = { $in: params.shortDescription };
  }

  return query;
};
const searchProducts = asyncHandler(async (req, res) => {
  try {
    let searchParams = req.query.query;

    if (!searchParams) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Search params are required."));
    }

    const searchTerms = searchParams.split(" ");

    const query = {
      $and: searchTerms.map((term) => ({
        $or: [
          { title: { $regex: term, $options: "i" } },
          { description: { $regex: term, $options: "i" } },
          { shortDescription: { $regex: term, $options: "i" } },
          { categories: { $regex: term, $options: "i" } },
          { stocks: !isNaN(term) ? Number(term) : null },
          { brand: { $regex: term, $options: "i" } },
          { productTags: { $regex: term, $options: "i" } },
          { type: { $regex: term, $options: "i" } },
          { itemType: { $regex: term, $options: "i" } },
          { tags: { $regex: term, $options: "i" } },
        ],
      })),
    };

    const products = await Product.find(query);

    if (products.length === 0) {
      await SearchData.create({ searchParam: searchParams });
      // Throw a 404 error if no products are found
      throw new ApiError(404, "No products found matching the criteria.");
    }

    // Return the found products
    return res.json(
      new ApiResponse(200, products, "Products retrieved successfully")
    );
  } catch (error) {
    // Handle unexpected errors
    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "An unexpected error occurred",
    });
  }
});
export {
  addProduct,
  getAllProducts,
  deleteProduct,
  getSingleProduct,
  updateProduct,
  searchProducts,
};

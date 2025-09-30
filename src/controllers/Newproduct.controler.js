import { Product } from "../models/NewProduct.modal.js";
import { Category } from "../models/Category.model.js"; // Import Category model
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { SearchData } from "../models/Search.modal.js";

const addProduct = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      description,
      categories,
      tags,
      shortDescription,
      youtubeVideoLink,
      flipkarturl,
      amazonurl,
      hasVariants,
      variants, // JSON array expected if hasVariants is true
      sku,
      price,
      cutPrice,
      discount,
      stocks,
    } = req.body;

    // Validate required fields
    if (!title || !description || !categories || !req.files?.image) {
      throw new ApiError(400, "Required fields missing");
    }

    // Validate category
    const existingCategory = await Category.findOne({
      categoriesTitle: categories,
      status: "active",
    });
    if (!existingCategory)
      throw new ApiError(400, `Invalid category: ${categories}`);

    // Upload images
    const uploadedImage = await uploadOnCloudinary(req.files.image[0].path);
    const uploadedThumbnails = req.files.thumbnail
      ? await Promise.all(
          req.files.thumbnail.map((f) => uploadOnCloudinary(f.path))
        )
      : [];
    const uploadedBanners = req.files.banners
      ? await Promise.all(
          req.files.banners.map((f) => uploadOnCloudinary(f.path))
        )
      : [];

    let productData = {
      title,
      description,
      categories,
      tags: Array.isArray(tags) ? tags : [tags],
      shortDescription,
      youtubeVideoLink,
      flipkarturl,
      amazonurl,
      image: uploadedImage.url,
      thumbnail: uploadedThumbnails.map((t) => t.url),
      banners: uploadedBanners.map((b) => b.url),
      hasVariants: hasVariants === "true" || hasVariants === true, // ensure boolean
    };

    if (productData.hasVariants) {
      // Parse variants
      let parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;
      if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
        throw new ApiError(400, "Variants are required and must be an array");
      }

      // Validate each variant
      parsedVariants.forEach((v, index) => {
        if (!v.sku || !v.price || !v.stocks) {
          throw new ApiError(
            400,
            `Variant at index ${index} is missing required fields`
          );
        }
        v.price = parseFloat(v.price);
        v.stocks = parseInt(v.stocks, 10);
        v.cutPrice = v.cutPrice ? parseFloat(v.cutPrice) : 0;
        v.discount = v.discount || "";
        if (isNaN(v.price) || isNaN(v.stocks)) {
          throw new ApiError(
            400,
            `Invalid price or stocks for variant at index ${index}`
          );
        }
      });

      productData.variants = parsedVariants;
    } else {
      // Single product: store SKU, price, cutPrice, discount, stocks directly
      if (!sku || !price || !stocks) {
        throw new ApiError(
          400,
          "SKU, price, and stocks are required for single product"
        );
      }
      productData.sku = sku;
      productData.price = parseFloat(price);
      productData.cutPrice = cutPrice ? parseFloat(cutPrice) : 0;
      productData.discount = discount || "";
      productData.stocks = parseInt(stocks, 10);
      if (isNaN(productData.price) || isNaN(productData.stocks)) {
        throw new ApiError(400, "Invalid price or stocks for single product");
      }
    }

    // Create product
    const newProduct = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Product created",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error:", error);
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
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
      amazonurl,
      flipkarturl,
      hasVariants,
      variants, // JSON array if hasVariants is true
    } = req.body;

    // Find existing product
    const product = await Product.findById(id);
    if (!product) throw new ApiError(404, "Product not found");

    // Validate SKU if single product
    if (!hasVariants && sku) {
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
      product.categories = categories;
    }

    // Handle file uploads
    if (req.files) {
      const { image, thumbnail, banners } = req.files;

      if (image) {
        const uploadedImage = await uploadOnCloudinary(image[0].path);
        if (!uploadedImage) throw new ApiError(400, "Failed to upload image");
        product.image = uploadedImage.url;
      }

      if (thumbnail) {
        const uploadedThumbnails = await Promise.all(
          thumbnail.map((file) => uploadOnCloudinary(file.path))
        );
        product.thumbnail = uploadedThumbnails.map((t) => t.url);
      }

      if (banners) {
        const uploadedBanners = await Promise.all(
          banners.map((file) => uploadOnCloudinary(file.path))
        );
        product.banners = uploadedBanners.map((b) => b.url);
      }
    }

    // Update general fields
    if (title) product.title = title;
    if (description) product.description = description;
    if (tags) product.tags = Array.isArray(tags) ? tags : [tags];
    if (shortDescription) product.shortDescription = shortDescription;
    if (youtubeVideoLink) product.youtubeVideoLink = youtubeVideoLink;
    if (amazonurl) product.amazonurl = amazonurl;
    if (flipkarturl) product.flipkarturl = flipkarturl;
    product.hasVariants = hasVariants === "true" || hasVariants === true;

    // Handle variants
    if (product.hasVariants) {
      if (!variants)
        throw new ApiError(400, "Variants are required for this product");
      let parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;

      parsedVariants.forEach((v, index) => {
        if (!v.sku || !v.price || !v.stocks) {
          throw new ApiError(
            400,
            `Variant at index ${index} is missing required fields`
          );
        }
        v.price = parseFloat(v.price);
        v.stocks = parseInt(v.stocks, 10);
        v.cutPrice = v.cutPrice ? parseFloat(v.cutPrice) : 0;
        v.discount = v.discount || "";
      });

      product.variants = parsedVariants;

      // Clear single product fields
      product.sku = undefined;
      product.price = undefined;
      product.stocks = undefined;
      product.cutPrice = undefined;
      product.discount = undefined;
    } else {
      // Single product fields
      if (sku) product.sku = sku;
      if (price) product.price = parseFloat(price);
      if (stocks) product.stocks = parseInt(stocks, 10);
      if (cutPrice) product.cutPrice = parseFloat(cutPrice);
      if (discount) product.discount = discount;
      // Clear variants
      product.variants = [];
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: product.toObject(),
    });
  } catch (error) {
    console.error("Error during product update:", error);

    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
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

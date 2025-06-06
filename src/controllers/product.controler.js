// import { Category } from "../models/Category.model.js";
// import { Product } from "../models/Product.models.js";
// import { ApiResponse } from "../utils/ApiResponse.js";

// import { ApiError } from "../utils/ApiError.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import { uploadOnCloudinary } from "../utils/Cloudinary.js";

// // const addProduct = async (req, res) => {
// //   try {
// //     if (!req.body) {
// //       throw new ApiError(400, "Request body is missing or empty");
// //     }

// //     const {
// //       name,
// //       description,
// //       price,
// //       discount,
// //       rating,
// //       shortDescription,
// //       visibility,
// //       tags,
// //       tax,
// //       hasAttributes,
// //       attributes,
// //       stockQuantity,
// //       stockStatus,
// //       categoryName,
// //       sku,
// //     } = req.body;

// //     // Parse JSON strings to objects/arrays
// //     const parsedAttributes = attributes ? JSON.parse(attributes) : [];
// //     const parsedTags = tags ? JSON.parse(tags) : [];

// //     // Check required fields
// //     if (
// //       ![
// //         name,
// //         description,
// //         price,
// //         stockQuantity,
// //         stockStatus,
// //         visibility,
// //         categoryName,
// //         sku,
// //       ].every((field) => field?.trim())
// //     ) {
// //       throw new ApiError(400, "All required fields must be filled");
// //     }

// //     // Ensure stockQuantity is a number and not a string
// //     const parsedStockQuantity = parseInt(stockQuantity, 10);
// //     if (isNaN(parsedStockQuantity)) {
// //       throw new ApiError(400, "Stock quantity must be a number");
// //     }

// //     const existingProduct = await Product.findOne({ name });
// //     if (existingProduct) {
// //       throw new ApiError(409, "Product with the same name already exists");
// //     }

// //     const category = await Category.findOne({ categoriesTitle: categoryName });
// //     if (!category) {
// //       throw new ApiError(404, `Category '${categoryName}' not found`);
// //     }

// //     const imageLocalPath = req.files?.image?.[0]?.path;
// //     const thumbnailFiles = req.files?.thumbnail;

// //     if (!imageLocalPath || !thumbnailFiles) {
// //       throw new ApiError(400, "Image and Thumbnail files are required");
// //     }

// //     const uploadedImage = await uploadOnCloudinary(imageLocalPath);

// //     const uploadedThumbnails = await Promise.all(
// //       thumbnailFiles.map((file) => uploadOnCloudinary(file.path))
// //     );

// //     if (!uploadedImage || !uploadedThumbnails) {
// //       throw new ApiError(400, "Failed to upload image or thumbnails");
// //     }

// //     const newProduct = await Product.create({
// //       name,
// //       description,
// //       price,
// //       discount,
// //       rating,
// //       thumbnail: uploadedThumbnails.map((file) => file.url),
// //       image: uploadedImage.url,
// //       visibility,
// //       shortDescription,
// //       tags: parsedTags,
// //       tax,
// //       hasAttributes: Boolean(hasAttributes),
// //       attributes: Array.isArray(parsedAttributes) ? parsedAttributes : [],
// //       stock: {
// //         quantity: parsedStockQuantity,
// //         status: stockStatus,
// //       },
// //       category: category.categoriesTitle,
// //       sku,
// //     });

// //     return res.status(201).json({
// //       success: true,
// //       message: "Product created successfully",
// //       product: newProduct.toObject(), // Convert Mongoose object to plain object
// //     });
// //   } catch (error) {
// //     console.error("Error during product creation:", error);

// //     if (error instanceof ApiError) {
// //       return res
// //         .status(error.statusCode)
// //         .json({ success: false, message: error.message });
// //     }

// //     return res
// //       .status(500)
// //       .json({ success: false, message: "Internal server error" });
// //   }
// // };

// // const deleteProduct = asyncHandler(async (req, res) => {
// //   const { id } = req.body;

// //   // Check if product exists
// //   const product = await Product.findById(id);
// //   if (!product) {
// //     return res
// //       .status(404)
// //       .json({ success: false, message: "Product not found" });
// //   }

// //   // Delete the product
// //   await Product.findByIdAndDelete(id);

// //   return res.json({
// //     success: true,
// //     message: "Product deleted successfully",
// //   });
// // });

// // const getAllProducts = async (req, res) => {
// //   try {
// //     const products = await Product.find().lean(); // Use lean() to get plain JavaScript objects instead of Mongoose documents

// //     return res.status(200).json({
// //       success: true,
// //       count: products.length,
// //       products: products,
// //     });
// //   } catch (error) {
// //     console.error("Error fetching products:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Failed to fetch products",
// //     });
// //   }
// // };
// // const getSingleProduct = asyncHandler(async (req, res) => {
// //   const { id } = req.query; // Assuming the product ID is passed in the URL parameter

// //   // Find the product by ID
// //   const product = await Product.findById(id);
// //   if (!product) {
// //     return res
// //       .status(404)
// //       .json({ success: false, message: "Product not found" });
// //   }

// //   return res.json({
// //     success: true,
// //     data: product,
// //     message: "Product retrieved successfully",
// //   });
// // });
// // const updateProduct = async (req, res) => {
// //   try {
// //     if (!req.body) {
// //       throw new ApiError(400, "Request body is missing or empty");
// //     }

// //     const {
// //       id,
// //       name,
// //       description,
// //       price,
// //       discount,
// //       rating,
// //       shortDescription,
// //       visibility,
// //       tags,
// //       tax,
// //       hasAttributes,
// //       attributes,
// //       stockQuantity,
// //       stockStatus,
// //       categoryName,
// //       sku,
// //     } = req.body;

// //     // Parse JSON strings to objects/arrays
// //     const parsedAttributes = attributes ? JSON.parse(attributes) : [];
// //     const parsedTags = tags ? JSON.parse(tags) : [];

// //     // Check required fields
// //     if (!id) {
// //       throw new ApiError(400, "Product ID is required");
// //     }

// //     const product = await Product.findById(id);
// //     if (!product) {
// //       throw new ApiError(404, "Product not found");
// //     }

// //     // Ensure stockQuantity is a number and not a string
// //     const parsedStockQuantity = stockQuantity
// //       ? parseInt(stockQuantity, 10)
// //       : product.stock.quantity;
// //     if (isNaN(parsedStockQuantity)) {
// //       throw new ApiError(400, "Stock quantity must be a number");
// //     }

// //     if (categoryName) {
// //       const category = await Category.findOne({
// //         categoriesTitle: categoryName,
// //       });
// //       if (!category) {
// //         throw new ApiError(404, `Category '${categoryName}' not found`);
// //       }
// //       product.category = category.categoriesTitle;
// //     }

// //     // Update product fields
// //     product.name = name || product.name;
// //     product.description = description || product.description;
// //     product.price = price || product.price;
// //     product.discount = discount || product.discount;
// //     product.rating = rating || product.rating;
// //     product.shortDescription = shortDescription || product.shortDescription;
// //     product.visibility = visibility || product.visibility;
// //     product.tags = parsedTags.length ? parsedTags : product.tags;
// //     product.tax = tax || product.tax;
// //     product.hasAttributes =
// //       hasAttributes !== undefined
// //         ? Boolean(hasAttributes)
// //         : product.hasAttributes;
// //     product.attributes = parsedAttributes.length
// //       ? parsedAttributes
// //       : product.attributes;
// //     product.stock.quantity = parsedStockQuantity;
// //     product.stock.status = stockStatus || product.stock.status;
// //     product.sku = sku || product.sku;

// //     const imageLocalPath = req.files?.image?.[0]?.path;
// //     const thumbnailFiles = req.files?.thumbnail;

// //     if (imageLocalPath) {
// //       const uploadedImage = await uploadOnCloudinary(imageLocalPath);
// //       if (!uploadedImage) {
// //         throw new ApiError(400, "Failed to upload image");
// //       }
// //       product.image = uploadedImage.url;
// //     }

// //     if (thumbnailFiles) {
// //       const uploadedThumbnails = await Promise.all(
// //         thumbnailFiles.map((file) => uploadOnCloudinary(file.path))
// //       );
// //       if (!uploadedThumbnails) {
// //         throw new ApiError(400, "Failed to upload thumbnails");
// //       }
// //       product.thumbnail = uploadedThumbnails.map((file) => file.url);
// //     }

// //     await product.save();

// //     return res.status(200).json({
// //       success: true,
// //       message: "Product updated successfully",
// //       product: product.toObject(), // Convert Mongoose object to plain object
// //     });
// //   } catch (error) {
// //     console.error("Error during product update:", error);

// //     if (error instanceof ApiError) {
// //       return res
// //         .status(error.statusCode)
// //         .json({ success: false, message: error.message });
// //     }

//     return res
//       .status(500)
//       .json({ success: false, message: "Internal server error" });
//   }
// };

// export {
//   addProduct,
//   deleteProduct,
//   getAllProducts,
//   getSingleProduct,
//   updateProduct,
// };

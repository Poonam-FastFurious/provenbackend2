// import { ApiError } from "../utils/ApiError.js";
// import { uploadOnCloudinary } from "../utils/Cloudinary.js";
// import { Category } from "../models/Category.model.js";
// import { Product } from "../models/Product.models.js";

// const addProduct = async (req, res) => {
//   try {
//     if (!req.body) {
//       throw new ApiError(400, "Request body is missing or empty");
//     }

//     const {
//       name,
//       description,
//       price,
//       discount,
//       rating,
//       shortDescription,
//       visibility,
//       tags,
//       tax,
//       hasAttributes,
//       attributes,
//       stockQuantity,
//       stockStatus,
//       categoryName,
//     } = req.body;

//     // Parse JSON strings to objects/arrays
//     const parsedAttributes = attributes ? JSON.parse(attributes) : [];
//     const parsedTags = tags ? JSON.parse(tags) : [];

//     // Check required fields
//     if (
//       ![
//         name,
//         description,
//         price,
//         stockQuantity,
//         stockStatus,
//         visibility,
//         categoryName,
//       ].every((field) => field?.trim())
//     ) {
//       throw new ApiError(400, "All required fields must be filled");
//     }

//     // Ensure stockQuantity is a number and not a string
//     const parsedStockQuantity = parseInt(stockQuantity, 10);
//     if (isNaN(parsedStockQuantity)) {
//       throw new ApiError(400, "Stock quantity must be a number");
//     }

//     const existingProduct = await Product.findOne({ name });
//     if (existingProduct) {
//       throw new ApiError(409, "Product with the same name already exists");
//     }

//     const category = await Category.findOne({ categoriesTitle: categoryName });
//     if (!category) {
//       throw new ApiError(404, `Category '${categoryName}' not found`);
//     }

//     const imageLocalPath = req.files?.image?.[0]?.path;
//     const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

//     if (!imageLocalPath || !thumbnailLocalPath) {
//       throw new ApiError(400, "Image and Thumbnail files are required");
//     }

//     const uploadedImage = await uploadOnCloudinary(imageLocalPath);
//     const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

//     if (!uploadedImage || !uploadedThumbnail) {
//       throw new ApiError(400, "Failed to upload image or thumbnail");
//     }

//     const newProduct = await Product.create({
//       name,
//       description,
//       price,
//       discount,
//       rating,
//       thumbnail: uploadedThumbnail.url,
//       visibility,
//       shortDescription,
//       tags: parsedTags,
//       tax,
//       hasAttributes: Boolean(hasAttributes),
//       attributes: Array.isArray(parsedAttributes) ? parsedAttributes : [],
//       stock: {
//         quantity: parsedStockQuantity,
//         status: stockStatus,
//       },
//       category: category.categoriesTitle,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Product created successfully",
//       product: newProduct.toObject(), // Convert Mongoose object to plain object
//     });
//   } catch (error) {
//     console.error("Error during product creation:", error);

//     if (error instanceof ApiError) {
//       return res
//         .status(error.statusCode)
//         .json({ success: false, message: error.message });
//     }

//     return res
//       .status(500)
//       .json({ success: false, message: "Internal server error" });
//   }
// };
// export { addProduct };

// import mongoose from "mongoose";
// const Schema = mongoose.Schema;

// // Define the Product schema
// const productSchema = new Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     price: {
//       type: Number,
//       required: true,
//     },
//     category: {
//       type: String,
//       ref: "Category",
//       required: true,
//     },
//     discount: {
//       type: String,
//     },
//     rating: {
//       type: Number,
//     },
//     thumbnail: [String],
//     image: String,
//     visibility: {
//       type: String,
//       enum: ["active", "inactive"],
//       default: "active",
//     },
//     shortDescription: String,
//     tags: [String],
//     tax: {
//       type: String,
//     },
//     hasAttributes: {
//       type: Boolean,
//       default: false,
//     },
//     // Array of dynamic attributes
//     attributes: [
//       {
//         attributeName: {
//           type: String,
//         },
//         attributeValue: {
//           type: String,
//         },
//       },
//     ],
//     // Stock information
//     stock: {
//       quantity: {
//         type: Number,
//       },
//       status: {
//         type: String,
//         enum: ["in_stock", "out_of_stock"],
//         default: "in_stock",
//       },
//     },
//     sku: {
//       type: String,
//       required: function () {
//         return this.isNew; // SKU is required only when the document is new
//       },
//     },
//   },
//   { timestamps: true }
// );

// export const Product = mongoose.model("Product", productSchema);

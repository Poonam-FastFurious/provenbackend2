import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    size: { type: String, trim: true },
    color: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    cutPrice: { type: Number, min: 0 },
    discount: { type: String, trim: true },
    stocks: { type: Number, required: true, min: 0 },
    sku: { type: String, unique: true, trim: true, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    categories: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    shortDescription: { type: String, trim: true },
    youtubeVideoLink: { type: String, trim: true },
    image: { type: String, required: true, trim: true },
    thumbnail: [{ type: String, trim: true }],
    banners: [{ type: String, trim: true }],
    flipkarturl: { type: String, trim: true },
    amazonurl: { type: String, trim: true },

    hasVariants: { type: Boolean, default: false },

    // Single product fields (only if hasVariants is false)
    sku: { type: String, trim: true, unique: true, sparse: true },
    price: { type: Number, min: 0 },
    cutPrice: { type: Number, min: 0 },
    discount: { type: String, trim: true },
    stocks: { type: Number, min: 0 },

    // Variants array (only if hasVariants is true)
    variants: { type: [variantSchema], default: undefined },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);

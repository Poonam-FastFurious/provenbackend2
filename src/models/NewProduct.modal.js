import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    stocks: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: String,
      trim: true,
    },
    cutPrice: {
      type: Number,
      min: 0,
    },
    categories: {
      type: String,
      trim: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    sku: {
      type: String,
      unique: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    youtubeVideoLink: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return /^(https?:\/\/)?(www\.)?youtube\.com\/watch/.test(v);
        },
        message: (props) => `${props.value} is not a valid YouTube URL`,
      },
    },
    thumbnail: [
      {
        type: String,
        trim: true,
      },
    ],
    banners: [
      {
        type: String,
        trim: true,
      },
    ],
    flipkarturl: {
      type: String,
      trim: true,
      required: true,
    },
    amazonurl: {
      type: String,
      trim: true,
      required: true,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);

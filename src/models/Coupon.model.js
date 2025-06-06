import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },

    discount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },
  },
  {
    timestamps: true, // Add timestamps to the schema
  }
);

export const Coupon = mongoose.model("Coupon", couponSchema);

import mongoose from "mongoose";

// Define the Inquiry schema
const inquirySchema = new mongoose.Schema({
      name: {
            type: String,
            required: true,
            trim: true,
      },
      email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]{2,}@[^\s@]+\.[^\s@]{2,}$/, 'Please enter a valid email address with at least two characters before "@" and after ".".']
      },
      mobile: {
            type: String,
            required: true,
            trim: true,
            match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number.']
      },
      pincode: {
            type: String,
            required: true,
            trim: true,
            match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode.']
      },
      product: {
            type: String,
            required: true,
            trim: true,
      },
      termsAccept: {
            type: Boolean,
            required: true,
      },
}, { timestamps: true });

// Create the Inquiry model from the schema
export const Inquiry = mongoose.model('Inquiry', inquirySchema);


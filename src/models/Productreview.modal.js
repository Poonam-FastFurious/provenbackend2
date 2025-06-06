import mongoose from "mongoose";


const reviewSchema = new mongoose.Schema({
      productName: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
      },
      name: {
            type: String,
            required: true,
      },
      avatar: {
            type: String,
      },
      email: {
            type: String,
            required: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      },
      rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
      },
      message: {
            type: String,
            required: true,
      },
}, {
      timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Create the Review model
export const Review = mongoose.model('Review', reviewSchema);



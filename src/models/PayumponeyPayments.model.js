import mongoose from "mongoose";

// Define the schema for a payment
const PayupaymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentID: {
      type: String,
      unique: true,
    },
    payuMoneyOrderId: {
      type: String,
    },
    payuMoneyPaymentId: {
      type: String,
    },
    payuMoneySignature: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
    paymentMethod: {
      type: String,
      enum: ["Credit Card", "PayPal", "Bank Transfer", "COD"],
      required: true,
    },
    paymentHistory: [
      {
        status: {
          type: String,
          enum: ["created", "paid", "failed"],
          default: "created",
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Middleware to update the payment history
PayupaymentSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.paymentHistory.push({ status: this.status });
  }
  next();
});

export const PayuPayment = mongoose.model("PayuPayment", PayupaymentSchema);

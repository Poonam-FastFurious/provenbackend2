import { log } from "console";
import crypto from "crypto";
import { PayuPayment } from "../models/PayumponeyPayments.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const initiatePayment = async (req, res) => {
  try {
    const { txnid, amount, productinfo, firstname, email, userId } = req.body;

    // Debugging - Log request body to ensure all fields are present
    console.log("Request body:", req.body);

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const key = process.env.PAYU_KEY; // Your PayUMoney key
    const salt = process.env.PAYU_SALT; // Your PayUMoney salt

    const udf1 = "";
    const udf2 = "";
    const udf3 = "";
    const udf4 = "";
    const udf5 = "";

    // Construct the string to hash
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;

    // Generate the SHA-512 hash
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    // Step 2: Create and save the payment in the Payment model
    const newPayment = new PayuPayment({
      user: userId, // Ensure userId is passed correctly
      paymentID: txnid, // Use txnid as paymentID
      order: txnid, // Add order field
      payuMoneyOrderId: txnid, // PayUMoney Order ID
      amount,
      currency: "INR",
      status: "created", // Initial payment status
      paymentMethod: "Credit Card",
    });

    await newPayment.save();

    // Step 3: Send the hash and other details to the client
    res.json({
      hash,
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
};

export const successpage = (req, res) => {
  const { txnid, amount, productinfo, firstname, email, status, hash } =
    req.body; // Extract relevant fields from the request body

  const key = process.env.PAYU_KEY; // Your PayU key
  const salt = process.env.PAYU_SALT; // Your PayU salt

  const udf1 = "";
  const udf2 = "";
  const udf3 = "";
  const udf4 = "";
  const udf5 = "";

  // Construct the hash string to verify
  const hashString = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

  // Generate the hash based on the response
  const generatedHash = crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");

  // Compare the generated hash with the hash received from PayU
  if (generatedHash === hash && status === "success") {
    // Hashes match and payment status is successful, redirect to success page
    res.redirect(`http://localhost:5173/success/${txnid}`);
  } else {
    // Hashes don't match or payment failed, redirect to error page
    res.redirect(`http://localhost:5173/error`);
  }
};

export const failedpage = (req, res) => {
  res.redirect(`http://localhost:5173/error`);
};

export const getAllpayuPayments = async (req, res) => {
  try {
    // Step 1: Fetch all payments from the database
    const payments = await PayuPayment.find();

    // Step 2: Check if payments were found
    if (!payments.length) {
      return res.status(404).json({ message: "No payments found" });
    }

    // Step 3: Return the list of payments to the client
    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve payments" });
  }
};

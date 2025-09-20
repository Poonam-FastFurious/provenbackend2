import axios from "axios";
import "dotenv/config";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// 🔹 WhatsApp login credentials from env
const EMAIL = process.env.ONEXTEL_EMAIL;
const PASSWORD = process.env.ONEXTEL_PASSWORD;
const SENDER_NUMBER = process.env.WHATSAPP_SENDER_NUMBER;
const JOURNEY_ID = process.env.WHATSAPP_JOURNEY_ID;
const TEMPLATE_ID = process.env.WHATSAPP_OTP_TEMPLATE_ID;

// 🔹 Login function to get 365cx token
async function getAuthToken() {
  try {
    const res = await axios.post(
      "https://365cx.io/account/enterprise/login",
      new URLSearchParams({
        email: EMAIL,
        password: PASSWORD,
        longTermToken: false,
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return res.data.response.token;
  } catch (err) {
    console.error("Login failed:", err.response?.data || err.message);
    throw new Error("Unable to login to 365cx");
  }
}

// 🔹 Generate random 6-digit OTP
function generateOTP(length = 6) {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

// 🔹 Send WhatsApp OTP
async function sendWhatsAppOTP(to, otp) {
  const token = await getAuthToken();

  const payload = {
    from: SENDER_NUMBER,
    to,
    journeyId: JOURNEY_ID,
    message: {
      template: {
        templateId: TEMPLATE_ID,
        parameterValues: {
          0: otp, // OTP
          1: ".", // keep original fixed params
          2: ".",
        },
      },
    },
  };

  return axios.post("https://365cx.io/chatbird/api/message/send", payload, {
    headers: {
      "Content-Type": "application/json",
      "authentication-token": token,
    },
  });
}

// 🔹 Request OTP Controller
export const requestOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      throw new ApiError(400, "Mobile number is required");
    }

    const user = await User.findOne({ mobile });

    if (!user) {
      throw new ApiError(
        404,
        "Your mobile number does not exist. Please sign up"
      );
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid 10 minutes
    await user.save();

    // Send WhatsApp OTP
    await sendWhatsAppOTP(user.mobile, otp);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "OTP sent to your mobile via WhatsApp"));
  } catch (error) {
    console.error("Error during OTP request:", error);

    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

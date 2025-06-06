import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import sendEmail from "../utils/SendEmail.js";
import axios from "axios";
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendSMS = async (mobile, otp) => {
  const apiUrl = `http://msg.venetsmedia.com/api/pushsms?user=proven01&authkey=92c24oHkJe8A&sender=PROVRO&mobile=${mobile}&text=Your+OTP+to+login+into+Proven+App+is+${otp}+PROVRO.&rpt=1&summary=1&output=json&entityid=1201161080253395052&templateid=1207172286223241222`;
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw new ApiError(500, "Something went wrong while sending SMS");
  }
};
const registerUser = asyncHandler(async (req, res, next) => {
  const { fullName, email, mobile } = req.body;

  // Validate required fields
  if ([email, fullName, mobile].some((field) => field?.trim() === "")) {
    return next(new ApiError(400, "All fields are required"));
  }

  // Check if a user with the provided email already exists
   // Check if a user with the provided email already exists
   const existingUserByEmail = await User.findOne({ email });
   if (existingUserByEmail) {
     return res.status(409).json({
       success: false,
       message: "User with this email already exists",
     });
   }

   // Check if a user with the provided mobile number already exists
   const existingUserByMobile = await User.findOne({ mobile });
   if (existingUserByMobile) {
     return res.status(409).json({
       success: false,
       message: "User with this mobile number already exists",
     });
   }

  // Create OTP and set expiration time
  const otp = generateOTP();

  // Create a new user with OTP, but not verified yet
  const user = await User.create({
    fullName,
    email,
    mobile,
    otp,
    otpExpires: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes
    isVerified: false, // Mark as unverified
  });

  // Send OTP via SMS
  await sendSMS(mobile, otp);

  // Inform user that OTP has been sent, but do not log them in yet
  return res.status(201).json({
    success: true,
    message: "OTP sent to your mobile. Please verify to complete registration.",
    data: null,
  });
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;

  // Check if mobile and OTP are provided
  if (!mobile || !otp) {
    throw new ApiError(400, "Mobile number and OTP are required");
  }
  console.log("Mobile:", mobile);
  console.log("OTP:", otp);

  // Find the user by mobile number
  const user = await User.findOne({ mobile });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if the OTP is correct and not expired
  if (user.otp !== otp || user.otpExpires < Date.now()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  // Mark the user as verified
  user.isVerified = true;
  user.otp = undefined; // Clear the OTP once verified
  user.otpExpires = undefined;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Your Account verified successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});
const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.query;

  if (!id) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await User.findById(id).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User profile fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  //TODO: delete old image - assignment

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password -refreshToken");

  if (!users) {
    throw new ApiError(404, "No users found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, users, "All users fetched successfully"));
});
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: "User not found" });
    }

    // Generate a reset token
    const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });

    // Construct the password reset link
    const resetLink = `http://provenro.brandbell.in/Reset-password/${user._id}/${token}`;

    // Use the sendEmail function to send the reset email
    await sendEmail({
      email: user.email,
      subject: ` "Reset Password Link"`,
      message: `Click the link to reset your password: ${resetLink}`,
    });

    res.status(200).json({
      status: "Success",
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("Error during forgot password:", error);

    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { id, token } = req.query;
    const { password } = req.body;

    // Verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        console.error("Error verifying token:", err);
        return res.status(400).json({ Status: "Error with token" });
      }

      // Check if the decoded token's user ID matches the provided ID
      if (decoded.id !== id) {
        return res
          .status(400)
          .json({ Status: "Invalid token for the provided user ID" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update the user's password in the database
      try {
        await User.findByIdAndUpdate(id, { password: hashedPassword });
        res.status(200).json({
          Status: "Success",
          message: "Password updated successfully",
        });
      } catch (err) {
        console.error("Error updating password:", err);
        res
          .status(500)
          .json({ Status: "Error", message: "Failed to update password" });
      }
    });
  } catch (error) {
    console.error("Error during reset password:", error);

    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const requestOTP = async (req, res) => {
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
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    await user.save();

    await sendSMS(user.mobile, otp);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "OTP sent to your mobile"));
  } catch (error) {
    console.error("Error during OTP request:", error);

    // Handle specific errors
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }

    // Handle other unexpected errors
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const verifyOTPAndLogin = asyncHandler(async (req, res) => {
  const generateAccessAndRefereshTokens = async (userId) => {
    try {
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      user.refreshToken = refreshToken;
      user.loginTime = new Date();
      await user.save({ validateBeforeSave: false });

      return { accessToken, refreshToken };
    } catch (error) {
      throw new ApiError(
        500,
        "Something went wrong while generating refresh and access token"
      );
    }
  };

  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      throw new ApiError(400, "Mobile number and OTP are required");
    }

    const user = await User.findOne({ mobile });

    if (!user) {
      throw new ApiError(
        404,
        "Your mobile number does not exist. Please sign up"
      );
    }

    const currentTime = Date.now();
    if (user.otp !== otp || user.otpExpires < currentTime) {
      throw new ApiError(401, "Invalid or expired OTP");
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );

    // Set options for cookies if needed
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure secure cookies in production
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
            user: {
              _id: user._id,
              mobile: user.mobile,
              name: user.fullName,
            },
          },
          "User logged in successfully"
        )
      );
  } catch (error) {
    console.error("Error during OTP verification and login:", error);

    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  getAllUsers,
  getUserProfile,
  forgotPassword,
  resetPassword,
  requestOTP,
  verifyOTPAndLogin,
  verifyOTP,
};

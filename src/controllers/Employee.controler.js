import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Employee } from "../models/Employee.model.js";
import { ApiError } from "../utils/ApiError.js";

const CreateEmployee = asyncHandler(async (req, res) => {
  const { name, email, password, mobileNumber, employeeRole } = req.body;

  if (
    [email, name, password, employeeRole].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedEmployee = await Employee.findOne({
    $or: [{ name }, { email }, { mobileNumber }],
  });

  if (existedEmployee) {
    throw new ApiError(
      409,
      "Employee with email/username/mobilenumber already exists"
    );
  }





  const employee = await Employee.create({
    name,
    email,
    mobileNumber,
    password,
    employeeRole,

  });

  await employee.save();
  const createdEmployee = await Employee.findById(employee._id).select();

  if (!createdEmployee) {
    throw new ApiError(500, "Something went wrong while Creating the Employee");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(200, createdEmployee, "Employee Created Successfully")
    );
});

// const UpdateEmployee = asyncHandler(async (req, res) => {
//   const { name, email, password, mobileNumber, employeeRole, id } = req.body;

//   if (
//     [email, name, password, employeeRole].some((field) => field?.trim() === "")
//   ) {
//     throw new ApiError(400, "All fields are required");
//   }





//   const employee = await Employee.findByIdAndUpdate(
//     id,
//     {
//       $set: {
//         name,
//         email,
//         mobileNumber,
//         password,
//         employeeRole,

//       },
//     },
//     { new: true }
//   ).select();

//   return res
//     .status(201)
//     .json(new ApiResponse(200, employee, "Employee Update Successfully"));
// });

const UpdateEmployee = asyncHandler(async (req, res) => {
  const { employeeId, name, email, password, mobileNumber, employeeRole } = req.body;

  if (!employeeId) {
    throw new ApiError(400, "Employee ID is required");
  }

  // Check if at least one field is provided
  if (!name && !email && !password && !employeeRole && !mobileNumber) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const existingEmployee = await Employee.findById(employeeId);

  if (!existingEmployee) {
    throw new ApiError(404, "Employee not found");
  }

  // If email or mobileNumber is being updated, check for conflicts
  if (email || mobileNumber) {
    const conflictingEmployee = await Employee.findOne({
      $or: [{ email }, { mobileNumber }],
      _id: { $ne: employeeId },
    });

    if (conflictingEmployee) {
      throw new ApiError(
        409,
        "Another employee with the same email or mobile number already exists"
      );
    }
  }

  // Update only the fields that are provided
  if (name) existingEmployee.name = name;
  if (email) existingEmployee.email = email;
  if (password) existingEmployee.password = password;  // Ensure password is hashed if needed
  if (mobileNumber) existingEmployee.mobileNumber = mobileNumber;
  if (employeeRole) existingEmployee.employeeRole = employeeRole;

  await existingEmployee.save();

  const updatedEmployee = await Employee.findById(employeeId).select();

  if (!updatedEmployee) {
    throw new ApiError(500, "Something went wrong while updating the Employee");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedEmployee, "Employee updated successfully")
    );
});



const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    throw new ApiError(400, "Employee ID is required");
  }

  const deletedEmployee = await Employee.findByIdAndDelete(id);

  if (!deletedEmployee) {
    throw new ApiError(404, "Employee not found");
  }

  return res.status(200).json({
    success: true,
    data: deletedEmployee,
    message: "Employee deleted successfully",
  });
});

const getAllEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find({}).select();

  if (!employees) {
    throw new ApiError(404, "No Employees found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, employees, "All Employees fetched successfully")
    );
});

const getEmployee = asyncHandler(async (req, res) => {
  const { id } = req.query;

  if (!id) {
    throw new ApiError(400, "Employee ID is required");
  }

  const employee = await Employee.findById(id).select("-password");

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { employee }, "Employee fetched successfully"));
});
const loginEmployee = asyncHandler(async (req, res) => {
  const generateAccessAndRefreshTokens = async (userId) => {
    try {
      const employee = await Employee.findById(userId);
      const accessToken = employee.generateAccessToken();
      const refreshToken = employee.generateRefreshToken();

      employee.refreshToken = refreshToken;
      employee.loginTime = new Date();
      await employee.save({ validateBeforeSave: false });

      return { accessToken, refreshToken };
    } catch (error) {
      throw new ApiError(
        500,
        "Something went wrong while generating refresh and access tokens"
      );
    }
  };

  try {
    const { email, mobileNumber, password } = req.body;

    if (!mobileNumber && !email) {
      throw new ApiError(400, "Mobile number or email is required");
    }

    const employee = await Employee.findOne({ $or: [{ mobileNumber }, { email }] });

    if (!employee) {
      throw new ApiError(404, "Employee does not exist");
    }

    const isPasswordValid = await employee.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      employee._id
    );

    const loggedInUser = await Employee.findById(employee._id).select(
      "-password -refreshToken"
    );
    employee.loginStatus = true;
    await employee.save({ validateBeforeSave: false });

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
          { user: loggedInUser, accessToken, refreshToken },
          "Employee logged in successfully"
        )
      );
  } catch (error) {
    console.error("Error during login:", error);

    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

const logoutEmployee = asyncHandler(async (req, res) => {
  try {
    const { employeeId } = req.body; // Assuming employeeId is sent in the request body

    if (!employeeId) {
      throw new ApiError(400, "Employee ID is required");
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }

    // Clear the refresh token and update login status
    employee.refreshToken = null;
    employee.loginStatus = false;
    await employee.save({ validateBeforeSave: false });

    // Clear the cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        "Employee logged out successfully"
      )
    );
  } catch (error) {
    console.error("Error during logout:", error);

    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export {
  CreateEmployee,
  UpdateEmployee,
  deleteEmployee,
  getAllEmployees,
  getEmployee,
  loginEmployee,
  logoutEmployee
};

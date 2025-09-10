import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Order } from "../models/Order.model.js"; // Assuming this is the correct path to your Order model
import { User } from "../models/User.model.js";
import { Admin } from "../models/Admin.model.js";
import { OrderNotification } from "../models/orderNotification.model.js";

const placeOrder = asyncHandler(async (req, res) => {
  const { customerId, products, totalAmount, shippingInfo, paymentInfo } =
    req.body;

  // Validate required fields
  if (
    !customerId ||
    !products ||
    !totalAmount ||
    !shippingInfo ||
    !paymentInfo
  ) {
    throw new ApiError(400, "All fields are required");
  }

  try {
    const customer = await User.findById(customerId);
    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }
    // Create the order
    const order = await Order.create({
      customer: customerId,
      customerName: customer.name,
      customerEmail: customer.email,
      products,
      totalAmount,
      shippingInfo,
      paymentInfo,
    });

    const admins = await Admin.find({}); // all admins
    for (const admin of admins) {
      await OrderNotification.create({
        user: admin._id, // notification belongs to admin
        order: order._id,
        message: `New order ${order.orderID} has been placed.`,
      });
    }
    return res
      .status(201)
      .json(new ApiResponse(201, order, "Order placed successfully"));
  } catch (error) {
    console.error("Error placing order:", error);
    throw new ApiError(500, "Something went wrong while placing the order");
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate, search } = req.query;

    let filter = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (search) {
      filter.$or = [
        { orderID: { $regex: search, $options: "i" } },
        { "customer.fullName": { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(filter).populate(
      "customer",
      "fullName email"
    );

    return res
      .status(200)
      .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new ApiError(500, "Something went wrong while fetching orders");
  }
});

const getOrderById = async (req, res) => {
  const { id } = req.params; // Extract the order ID from request parameters

  try {
    // Find the order by ID and populate the user, product, and address details
    const order = await Order.findById(id)
      .populate("customer", "fullName email mobile") // Populate customer details
      .populate({
        path: "products.product", // Populate product details
        model: "Product", // Correct model name
        select: "title image stocks price categories", // Fields to select
      })
      .populate({
        path: "shippingInfo.address", // Populate the shipping address details
        model: "UserAddress", // Reference the correct address model
        select:
          "fullName phoneNumber streetAddress city state postalCode country addressType", // Select relevant fields for the address
      });

    // If order is not found, return an error response
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // If order is found, return success response with order details
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    // If any error occurs during retrieval, return an error response
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const updateOrderStatus = asyncHandler(async (req, res) => {
  try {
    const orderId = req.body.orderID;

    if (!orderId) {
      throw new ApiError(400, "Order ID is required");
    }

    const { status, shippingLink } = req.body;

    if (!status) {
      throw new ApiError(400, "Status field is required");
    }

    // Check if the status is one of the allowed values
    const allowedStatusValues = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];
    if (!allowedStatusValues.includes(status)) {
      throw new ApiError(400, "Invalid status value");
    }

    // Find the order by orderID and update its status and shippingLink
    const order = await Order.findOne({ orderID: orderId });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Update status and shippingLink
    order.status = status;
    if (shippingLink) {
      order.shippingInfo.shippingLink = shippingLink;
    }

    // Manually add to order history and set the flag
    order.orderHistory.push({ status });
    order.skipOrderHistoryUpdate = true;

    // Save the updated order
    await order.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          order,
          "Order status and shipping link updated successfully"
        )
      );
  } catch (error) {
    console.error("Error updating order status:", error);
    if (error instanceof ApiError) {
      throw error;
    } else {
      throw new ApiError(
        500,
        "Something went wrong while updating order status"
      );
    }
  }
});
export const getTotalPayments = async (req, res) => {
  try {
    // Aggregate the totalAmount from all orders
    const totalPayments = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    // If no orders exist, return total as 0
    const totalAmount = totalPayments.length > 0 ? totalPayments[0].total : 0;

    res.status(200).json({
      success: true,
      totalAmount,
    });
  } catch (error) {
    console.error("Error calculating total payments:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export { placeOrder, getAllOrders, updateOrderStatus, getOrderById };

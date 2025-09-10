import { Product } from "../../models/NewProduct.modal.js";
import { Order } from "../../models/Order.model.js";
import { User } from "../../models/User.model.js";

export const getDashboardData = async (req, res) => {
  try {
    // Get date range from query params
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    // Total amount and total orders filtered by date
    const orderStats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const totalAmount = orderStats[0]?.totalAmount || 0;
    const totalOrders = orderStats[0]?.totalOrders || 0;

    // Total products (filtering by creation date if needed)
    const totalProducts = await Product.countDocuments(dateFilter);

    // Total users (filtering by creation date if needed)
    const totalUsers = await User.countDocuments(dateFilter);

    res.status(200).json({
      totalAmount,
      totalOrders,
      totalProducts,
      totalUsers,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

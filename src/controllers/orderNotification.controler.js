
import { OrderNotification } from "../models/orderNotification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";



// Fetch notifications for admin
export const getAdminNotifications = asyncHandler(async (req, res) => {
  const notifications = await OrderNotification.find({
    user: req.params.adminId,
  })
    .sort({ createdAt: -1 })
    .limit(20); // last 20 notifications
  res.status(200).json({ success: true, notifications });
});

// Mark notification as read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.body;
  const notification = await OrderNotification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
  res.status(200).json({ success: true, notification });
});

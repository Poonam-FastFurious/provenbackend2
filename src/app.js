import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "https://provenadmin.brandbell.in",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes import

import adminrouter from "./routes/Admin.routes.js";
import userrouter from "./routes/user.routes.js";
import tax from "./routes/tax.routes.js";
import coupon from "./routes/coupon.routes.js";
import deliverycharg from "./routes/Delivercharg.routes.js";
import category from "./routes/Category.routes.js";
import Banner from "./routes/Banner.routes.js";
import Product from "./routes/NewProduct.routes.js";
import cart from "./routes/cart.routes.js";
import Order from "./routes/Order.routes.js";
import paymentRoutes from "./routes/Payments.routes.js";
import privacy from "./routes/Privacypolicy.routes.js";
import termscondtion from "./routes/Termscondition.routes.js";
import blogs from "./routes/Bloge.routes.js";
import subcategory from "./routes/Subcaegory.routes.js";
import addon from "./routes/Addon.routes.js";
import Sliders from "./routes/Slider.routes.js";
import ReturnPolicy from "./routes/ReturnPolicy.routes.js";
import faqs from "./routes/Faq.routes.js";
import testimonials from "./routes/Testimonial.routes.js";
import Employee from "./routes/Employee.routes.js";
import Notification from "./routes/Notification.routes.js";
import EmployeeRole from "./routes/EmployeeRole.routes.js";
import wishlist from "./routes/Wishlist.routes.js";
import useraddress from "./routes/Address.routes.js";
import Inquiry from "./routes/Inquiry.routes.js";
import review from "./routes/Review.routes.js";
import search from "./routes/Search.routes.js";
import Storelocation from "./routes/StoreLocation.routes.js";
//routes declearetion

app.use("/api/v1/admin", adminrouter);
app.use("/api/v1/user", userrouter);
app.use("/api/v1/tax", tax);
app.use("/api/v1/coupon", coupon);
app.use("/api/v1/deliverycharg", deliverycharg);
app.use("/api/v1/category", category);
app.use("/api/v1/Banner", Banner);
app.use("/api/v1/Product", Product);
app.use("/api/v1/cart", cart);
app.use("/api/v1/order", Order);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/privacy", privacy);
app.use("/api/v1/terms", termscondtion);
app.use("/api/v1/blog", blogs);
app.use("/api/v1/subcategory", subcategory);
app.use("/api/v1/addons", addon);
app.use("/api/v1/slider", Sliders);
app.use("/api/v1/Returnpolicy", ReturnPolicy);
app.use("/api/v1/faq", faqs);
app.use("/api/v1/testimonial", testimonials);
app.use("/api/v1/Employee", Employee);
app.use("/api/v1/Notification", Notification);
app.use("/api/v1/EmployeeRole", EmployeeRole);
app.use("/api/v1/wishlist", wishlist);
app.use("/api/v1/address", useraddress);
app.use("/api/v1/Inquiry", Inquiry);
app.use("/api/v1/review", review);
app.use("/api/v1/serach", search);
app.use("/api/v1/Storelocation", Storelocation);
export { app };

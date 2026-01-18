import "reflect-metadata";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./database";
import { BrandRoute } from "./features/brand";
import { OrderRoute } from "./features/order";
import { ProductRoute } from "./features/product";
import { UserRoute } from "./features/user";
import { AddressRoute } from "./features/address";
import { ReviewRoute } from "./features/review";
import { VnpayRoute } from "./features/payment";
import { ProfileRoute } from "./features/profile";
import { NotificationRoute } from "./features/notification";
import { AdminUsersRoute } from "./admin/users";
import { AdminBrandsRoute } from "./admin/brands";
import { AdminProductsRoute, AdminVariantsRoute } from "./admin/products";
import { AdminOrdersRoute } from "./admin/orders";
import { AdminVouchersRoute } from "./admin/vouchers";
import { AdminDashboardRouter } from "./admin/homes";
import { VouchersRouter } from "./features/voucher";

dotenv.config();
console.log("VNP_TMN_CODE:", process.env.VNP_TMN_CODE);
console.log("VNP_HASH_SECRET:", process.env.VNP_HASH_SECRET);
console.log("VNP_URL:", process.env.VNP_URL);
console.log("VNP_RETURN_URL:", process.env.VNP_RETURN_URL);
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(BrandRoute);
app.use(VnpayRoute);
app.use(OrderRoute);
app.use(ProductRoute);
app.use(UserRoute);
app.use(AddressRoute);
app.use(ReviewRoute);
app.use(ProfileRoute);
app.use(NotificationRoute);
app.use(AdminUsersRoute);
app.use(AdminBrandsRoute);
app.use(AdminProductsRoute);
app.use(AdminVariantsRoute);
app.use(AdminOrdersRoute);
app.use(AdminVouchersRoute);
app.use(AdminDashboardRouter);
app.use(VouchersRouter);
// Connect to MongoDB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  });

export default app;

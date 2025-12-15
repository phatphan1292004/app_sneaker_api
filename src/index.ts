import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './database';
import { BrandRoute } from './features/brand';
import { OrderRoute } from './features/order';
import { ProductRoute } from './features/product';
import { UserRoute } from './features/user';
import { AddressRoute } from './features/address';
import { ReviewRoute } from './features/review';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(BrandRoute);
app.use(OrderRoute);
app.use(ProductRoute);
app.use(UserRoute);
app.use(AddressRoute);
app.use('/reviews', ReviewRoute);

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

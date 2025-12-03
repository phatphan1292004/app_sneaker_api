import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.get('/', (_req, res) => {
  res.json({ 
    message: 'Welcome to Sneaker Platform API',
    version: '1.0.0'
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

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

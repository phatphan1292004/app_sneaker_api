import { DataSource } from 'typeorm';
import { Brand } from '../entities';

export const AppDataSource = new DataSource({
  type: 'mongodb',
  url: process.env.MONGO_URI,
  synchronize: true, // Set to false in production
  logging: process.env.NODE_ENV === 'development',
  entities: [Brand],
});

export const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ MongoDB Connected via TypeORM');
    console.log(`📦 Database: ${AppDataSource.options.database || 'app-sneaker'}`);
  } catch (error: any) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('👋 TypeORM connection closed due to app termination');
  }
  process.exit(0);
});

export default connectDB;

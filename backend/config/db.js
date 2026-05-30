import mongoose from 'mongoose';
import { dbState } from './dbState.js';

export const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quiz_platform';
    console.log(`Connecting to MongoDB at: ${connUri}...`);
    
    // Set a short timeout (3 seconds) for quick connection attempt, so the server starts fast even if MongoDB is not running
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 3000
    });
    
    console.log(`MongoDB Connected Successfully! Host: ${conn.connection.host}`);
    dbState.useMongo = true;
  } catch (error) {
    console.warn(`MongoDB Connection Failed: ${error.message}`);
    
    if (process.env.DB_FALLBACK_TO_JSON === 'true') {
      console.log('Fallback Enabled: Server is running on resilient local JSON Filesystem database!');
      dbState.useMongo = false;
    } else {
      console.error('Fallback disabled. Exiting application.');
      process.exit(1);
    }
  }
};
